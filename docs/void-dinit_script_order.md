Void Linux Startup - Runit vs Dinit

| Runit Script Order
|:------------------
01. /etc/runit/1
02. /etc/runit/2
03. /etc/runit/core-services/00-psuedo-filesystems
04. /etc/runit/core-services/00-sysfs-depmod
05. /etc/runit/core-services/01-udev-trigger
06. /etc/runit/core-services/02-udev-settle
07. /etc/runit/core-services/03-filesystems
08. /etc/runit/core-services/04-fstab
09. /etc/runit/core-services/05-swap
10. /etc/runit/core-services/06-loopback
11. /etc/runit/core-services/07-hostname
12. /etc/runit/core-services/08-hwclock
13. /etc/runit/core-services/09-random-seed
14. /etc/runit/core-services/10-00-sysctl
15. /etc/runit/core-services/10-01-uclogd
16. /etc/runit/runsvdir/default  (many services)
17. /etc/runit/3

| Dinit Service Order
|:-------------------

boot
  ↳ ttys
  ↳ void-core-services
      # putting all of runit's startup scripts here so they run sequentially
      # will unwind and move them later
  ↳ boot.d
      # the services like early-filesystems are actually within void-core-services
      # the duplication will be removed here and the actual service order unwound later
