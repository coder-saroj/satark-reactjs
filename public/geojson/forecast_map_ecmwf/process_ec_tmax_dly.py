#! /usr/bin/env python3

import sys,os,numpy as np,logging
from netCDF4 import Dataset as ncopen,num2date
from matplotlib import pyplot as plt
from cartopy import crs as ccrs,feature as cfeature
from datetime import datetime as dt
import json,geojsoncontour as gjcont
import mysql.connector as mconn




# disable log for bitch matplotlib!
logging.getLogger('matplotlib').setLevel(logging.WARNING)

os.makedirs('/home/satark_web/logs', exist_ok=True)
logging.basicConfig(filename='/home/satark_web/logs/ec_tmax_log.log', level=logging.DEBUG)


# 2019-06-18_UTC00 + 10d : 2019-06-28 [UTC00-24]



# db connection
__db__ =mconn.connect(
		host="localhost",
		user="osdma_user",
		database="osdma_db",
		passwd="osdma@ADMIN123"
	) 
 




def main(ncfilename,out_dir):

	try:
		ncf = ncopen(ncfilename,'r')
		if(ncf): logging.debug("NETCDF read successfull.")
	except:
		logging.debug("Unable to read netcdf file: "+ncfilename)
		sys.exit()

	lats   = ncf.variables['latitude'][:]
	lons   = ncf.variables['longitude'][:]
	times  = ncf.variables['time']
	temp = ncf.variables['t2m'][:] - 273.15 # kelvin to celsious 

	LtM = (lats >= 4) & (lats <= 45)
	LoM = (lons >= 45) & (lons <= 100)


	dates = num2date(times[:],times.units)
	# analysis_time = dt.strftime(dates[0],'%Y-%m-%d_UTC%H')
	# analysis_date = dt.strftime(dates[0],'%Y-%m-%d')
	analysis_time = dates[0].strftime('%Y-%m-%d_UTC%H')
	analysis_date = dates[0].strftime('%Y-%m-%d')
	
	if out_dir[-1] !='/': out_dir+='/'

	json_output_dir = out_dir+analysis_date
	if not os.path.exists(out_dir+analysis_date): os.makedirs(out_dir+analysis_date)


	finfo    = []
	list_tid = []
	for tid, hr  in np.ndenumerate(times[:]):
		
		tid=tid[0]
		
		if hr%24==0 and tid!=0:

			list_tid.append(tid)

			del_hr = hr-times[0]
			
			# calculate daily form accumulation
			
			print(tid-3,tid)

			tempT = np.amax(temp[tid-3:tid+1],axis=0)
			

			ax = plt.axes(projection = ccrs.PlateCarree())

			croppedTEMP = tempT[np.ix_(LtM,LoM)]

			# lvls = np.array([-10,-5,0,5,10,15,20,25,30,35,40,45,50,60,70])
			lvls = np.arange(-10,51)

			cf = plt.contourf(lons[LoM],lats[LtM],croppedTEMP,cmap='plasma',levels=lvls)

			#
			geojson = gjcont.contourf_to_geojson_overlap(
				contourf=cf,
				ndigits=3,
				stroke_width=0,
				fill_opacity=1,
				geojson_properties=None
				# unit=''
			)

			geojsonFname = f'temp.max.at_{analysis_time}.d_{int(del_hr/24):02}.geojson'

			with open(json_output_dir+'/'+geojsonFname,'w') as jf:
				jf.write(geojson)


			cbar = plt.colorbar(orientation='horizontal')


			cbar.outline.set_visible(False)
			
			# plot colorbar only
			ax.remove()
			
			cbarFname = f'cbar.temp.max.ad_{analysis_time}.d_{int(del_hr/24):02}.svg'
			plt.savefig(json_output_dir+'/'+cbarFname,pad_inches=0,bbox_inches = 'tight')


			finfo.append({
				'geojson':geojsonFname,
				'cbar':cbarFname,
				'day':int(del_hr/24),
				'fdate':dates[tid-4].strftime('%Y-%m-%d') 
			})

			# always always close
			plt.close()
			# break
	
	with open(json_output_dir+'/'+f'info.{analysis_date}.json','w') as jfi:
		iDict = {
			'atime': analysis_time,
			'adate': analysis_date,
			'fdata': finfo,

		} 
		jfi.write(json.dumps(iDict))
		print(json_output_dir, 'fff')

	

	logging.debug('End executing process_ec_pr_dly.')
	logging.debug('Updating database state')


	cur = __db__.cursor()
	query = "UPDATE forecast_state SET ec_tmax_dly_update = '"+str(analysis_date)+"'";

	cur.execute(query)
	res = __db__.commit()

	if cur.rowcount > 0:
		print('successfully updated state')


	return


if __name__ == '__main__':

	# sys.argv.append('20190620R1D.nc')
	# sys.argv.append('/home/nazmul/www/osdma/DATA/forecast_data/ecmwf/tmax/')
	main(sys.argv[1],sys.argv[2])
