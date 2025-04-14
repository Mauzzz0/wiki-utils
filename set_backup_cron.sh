(crontab -l 2>/dev/null; echo "0 6 * * * /root/wiki/wiki-utils/backup.sh") | crontab -
