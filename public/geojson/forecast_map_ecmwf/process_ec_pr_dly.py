#! /usr/local/bin/python3.7

import sys, os, numpy as np, logging
from netCDF4 import Dataset as ncopen, num2date
from matplotlib import pyplot as plt
from datetime import datetime as dt
import json, geojsoncontour as gjcont
import mysql.connector as mconn
import palettable as palette
import matplotlib as mpl

# Custom colormap
color_list = [
    '#dddfff', '#c2c2ff', '#9799ff', '#6666fc', '#4a49e7', '#0c850b',
    '#0db110', '#8a8a8a', '#8b8b8b', '#fefc06', '#ffd00e', '#fea110',
    '#fd5515', '#cc0e0f', '#670a08', '#310d0d'
]
imd_pr_cmap = mpl.colors.LinearSegmentedColormap.from_list('imd_pr_cmap', color_list)

# Logging setup
os.makedirs('/home/satark_web/logs', exist_ok=True)
logging.basicConfig(filename='/home/satark_web/logs/ec_precip_log.log', level=logging.DEBUG)
logging.getLogger('matplotlib').setLevel(logging.WARNING)

# DB connection
__db__ = mconn.connect(
    host="localhost",
    user="osdma_user",
    database="osdma_db",
    passwd="osdma@ADMIN123"
)


def main(ncfilename, out_dir, year=None, mon=None, day=None):
    try:
        ncf = ncopen(ncfilename, 'r')
        if ncf:
            print("NETCDF read successfull.")
    except:
        logging.debug("Unable to read netcdf file: " + ncfilename)
        sys.exit()

    lats = ncf.variables['latitude'][:]
    lons = ncf.variables['longitude'][:]
    times = ncf.variables['time']
    precip = ncf.variables['lsp'][:] + ncf.variables['cp'][:]

    LtM = (lats >= 4) & (lats <= 45)
    LoM = (lons >= 45) & (lons <= 100)

    dates = num2date(times[:], times.units)
    analysis_time = dates[0].strftime('%Y-%m-%d_UTC%H')

    # 🟡 Override date if provided from bash script
    if year and mon and day:
        analysis_date = f"{year}-{mon.zfill(2)}-{day.zfill(2)}"
    else:
        analysis_date = dates[0].strftime('%Y-%m-%d')

    if out_dir[-1] != '/':
        out_dir += '/'

    json_output_dir = out_dir + analysis_date
    if not os.path.exists(json_output_dir):
        os.makedirs(json_output_dir)

    finfo = []
    list_tid = []

    for tid, hr in np.ndenumerate(times[:]):
        tid = tid[0]

        if hr % 24 == 0 and tid != 0:
            list_tid.append(tid)
            del_hr = hr - times[0]

            # calculate daily from accumulation
            if tid - 4 == 0:
                precipT = (precip[tid]) * 1000  # M to mm
            elif tid - 4 > 0:
                precipT = (precip[tid] - precip[tid - 4]) * 1000

            ax = plt.axes()
            croppedPRECIP = precipT[np.ix_(LtM, LoM)]
            lvls = np.array([1, 5, 10, 15, 20, 25, 30, 35, 40, 50, 75, 100, 125, 150, 175, 200])

            cf = plt.contourf(
                lons[LoM], lats[LtM], croppedPRECIP,
                cmap=imd_pr_cmap, levels=lvls, extend='max'
            )

            geojson = gjcont.contourf_to_geojson_overlap(
                contourf=cf,
                ndigits=3,
                stroke_width=0,
                fill_opacity=1,
                geojson_properties=None
            )

            geojsonFname = f'pr.acc.at_{analysis_time}.d_{int(del_hr/24):02}.geojson'
            with open(json_output_dir + '/' + geojsonFname, 'w') as jf:
                jf.write(geojson)

            cbar = plt.colorbar(orientation='horizontal')
            cbar.outline.set_visible(False)
            ax.remove()

            cbarFname = f'cbar.pr.acc.ad_{analysis_time}.d_{int(del_hr/24):02}.svg'
            plt.savefig(json_output_dir + '/' + cbarFname, pad_inches=0, bbox_inches='tight')

            finfo.append({
                'geojson': geojsonFname,
                'cbar': cbarFname,
                'day': int(del_hr / 24),
                'fdate': dates[tid - 4].strftime('%Y-%m-%d')
            })

            plt.close()

    # Save info.json
    with open(json_output_dir + '/' + f'info.{analysis_date}.json', 'w') as jfi:
        iDict = {
            'atime': analysis_time,
            'adate': analysis_date,
            'fdata': finfo,
        }
        jfi.write(json.dumps(iDict))

    print(json_output_dir, 'fff')
    print('End executing process_ec_pr_dly.')
    print('Updating database state')

    # DB Update
    cur = __db__.cursor()
    try:
        query = "UPDATE forecast_state SET ec_pr_dly_update = %s"
        cur.execute(query, (analysis_date,))
        __db__.commit()

        if cur.rowcount > 0:
            print('Successfully updated state')
    except Exception as e:
        print("⚠️ Database update failed:", e)
        logging.debug(str(e))
    finally:
        cur.close()


if __name__ == '__main__':
    if len(sys.argv) >= 6:
        main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    else:
        main(sys.argv[1], sys.argv[2])
