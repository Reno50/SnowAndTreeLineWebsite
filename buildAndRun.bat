cd WebFrontend
call npm run build
cd ..
cd PyBackend
call flask --app WebServer run