(crontab -l 2>/dev/null; echo "0 6 * * * /root/wiki/backup.sh > /root/wiki/backup.log 2>&1") | crontab -
