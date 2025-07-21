#! /usr/bin/env python3

import sys, os, numpy as np, logging
from netCDF4 import Dataset as ncopen, num2date
from matplotlib import pyplot as plt
from cartopy import crs as ccrs
import json, geojsoncontour as gjcont
import mysql.connector as mconn
from datetime import datetime as dt

# Prevent _ARRAY_API error (caused by numpy/cython mismatch)
import numpy.core._multiarray_umath

# Setup logging
os.makedirs('/home/satark_web/logs', exist_ok=True)
logging.basicConfig(filename='/home/satark_web/logs/ec_rhavg_log.log', level=logging.DEBUG)

# DB Connection
__db__ = mconn.connect(
    host="localhost",
    user="osdma_user",
    database="osdma_db",
    passwd="osdma@ADMIN123"
)

def main(ncfilename, out_dir):
    try:
        ncf = ncopen(ncfilename, 'r')
        logging.debug("✅ NETCDF read successful.")
    except Exception as e:
        logging.error(f"❌ Failed to read NetCDF file: {e}")
        sys.exit("Cannot proceed without a valid NetCDF file.")

    lats = ncf.variables['latitude'][:]
    lons = ncf.variables['longitude'][:]
    times = ncf.variables['time']
    
    try:
        d2m = ncf.variables['d2m'][:]
        t2m = ncf.variables['t2m'][:]
    except KeyError as e:
        logging.error(f"Missing variable in NetCDF: {e}")
        sys.exit("Cannot proceed without required variables.")

    E = 0.611 * np.exp(5423 * ((1 / 273) - 1 / d2m))
    ES = 0.611 * np.exp(5423 * ((1 / 273) - 1 / t2m))
    rh = (E / ES) * 100

    LtM = (lats >= 4) & (lats <= 45)
    LoM = (lons >= 45) & (lons <= 100)

    dates = num2date(times[:], times.units)
    analysis_time = dates[0].strftime('%Y-%m-%d_UTC%H')
    analysis_date = dates[0].strftime('%Y-%m-%d')

    if out_dir[-1] != '/': out_dir += '/'
    json_output_dir = os.path.join(out_dir, analysis_date)
    os.makedirs(json_output_dir, exist_ok=True)

    finfo = []
    list_tid = []

    for tid, hr in np.ndenumerate(times[:]):
        tid = tid[0]
        if hr % 24 == 0 and tid != 0:
            list_tid.append(tid)
            del_hr = hr - times[0]

            rhT = np.average(rh[tid-3:tid+1], axis=0)

            ax = plt.axes(projection=ccrs.PlateCarree())
            croppedRH = rhT[np.ix_(LtM, LoM)]
            logging.debug(f"Min RH: {croppedRH.min()}")

            lvls = np.arange(0, 96)
            cf = plt.contourf(lons[LoM], lats[LtM], croppedRH, cmap='summer_r', levels=lvls)

            geojson = gjcont.contourf_to_geojson_overlap(
                contourf=cf,
                ndigits=3,
                stroke_width=0,
                fill_opacity=1
            )

            geojsonFname = f'rh.avg.at_{analysis_time}.d_{int(del_hr/24):02}.geojson'
            with open(os.path.join(json_output_dir, geojsonFname), 'w') as jf:
                jf.write(geojson)

            cbar = plt.colorbar(orientation='horizontal')
            cbar.outline.set_visible(False)
            ax.remove()

            cbarFname = f'cbar.rh.avg.ad_{analysis_time}.d_{int(del_hr/24):02}.svg'
            plt.savefig(os.path.join(json_output_dir, cbarFname), pad_inches=0, bbox_inches='tight')

            finfo.append({
                'geojson': geojsonFname,
                'cbar': cbarFname,
                'day': int(del_hr / 24),
                'fdate': dates[tid - 4].strftime('%Y-%m-%d')
            })

            plt.close()

    with open(os.path.join(json_output_dir, f'info.{analysis_date}.json'), 'w') as jfi:
        iDict = {
            'atime': analysis_time,
            'adate': analysis_date,
            'fdata': finfo,
        }
        jfi.write(json.dumps(iDict))

    logging.debug('✅ End executing process_ec_pr_dly.')
    logging.debug('🔄 Updating database state.')

    cur = __db__.cursor()
    update_query = f"UPDATE forecast_state SET ec_rhavg_dly_update = '{analysis_date}'"
    cur.execute(update_query)
    __db__.commit()

    if cur.rowcount > 0:
        print('✅ Successfully updated database state.')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python process_ec_rhavg.py <netcdf_file> <output_dir>")
        sys.exit()
    main(sys.argv[1], sys.argv[2])
