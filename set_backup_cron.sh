(crontab -l 2>/dev/null; echo "0 1 * * * cd ~/wiki/wiki-utils && npm run backup") | crontab -
