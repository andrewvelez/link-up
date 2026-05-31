
## Run sequentially

run /etc/runit/1
  ↳ load /etc/runit/functions
  ↳ load /etc/rc.conf
  ↳ run all /etc/runit/core-services
    ↳
      $ ls -1
      00-pseudofs.sh
      01-static-devnodes.sh
      02-kmods.sh
      02-udev.sh
      03-console-setup.sh
      03-filesystems.sh
      04-swap.sh
      05-misc.sh
      08-sysctl.sh
      10-runit-control.sh
      97-dmesg.sh
      98-sbin-merge.sh
      99-cleanup.sh
      99-live-audio.sh

## Maybe run in parallel

run all /var/service/*
