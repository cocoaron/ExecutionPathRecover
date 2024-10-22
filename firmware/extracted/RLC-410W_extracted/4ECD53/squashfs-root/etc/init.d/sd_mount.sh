#! /bin/sh

insmod /lib/modules/4.1.0/kernel/drivers/mmc/core/mmc_core.ko
insmod /lib/modules/4.1.0/kernel/drivers/mmc/card/mmc_block.ko
insmod /lib/modules/4.1.0/kernel/drivers/mmc/host/mmc-na51023.ko
