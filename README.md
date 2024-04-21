## Simple image processing application. 

- Application takes an array of images and processing options. 
- Gathers core numbers of the system
- Creates chunks according to number of cores in the system
- Processes each chunk in worker threads
- Packages processed images returned from worker threads in a .zip archive
- Saves it in /tmp folder
- Creates a download link for user to download
