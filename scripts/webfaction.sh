#!/bin/bash

# Intended for use in cron jobs

LOG_PATH=${2-server.log}
BASE_DIR=$(dirname "$(readlink -f "$0")")/..

add_max_to_queue="node ${BASE_DIR}/scripts/addFeedsToBeParsedForMaxEpisodes.js"
add_recent_to_queue="node ${BASE_DIR}/scripts/addFeedsToBeParsedForRecentEpisodes.js"
parse_next_feed="node ${BASE_DIR}/scripts/parseNextFeedFromQueue.js"

case $1 in
  addMaxToQueue)
    cd ${BASE_DIR}
    nohup ${add_max_to_queue} &>> ${LOG_PATH}
    ;;

  addRecentToQueue)
    cd ${BASE_DIR}
    nohup ${add_recent_to_queue} &>> ${LOG_PATH}
    ;;

  parseNextFeedFromQueue)
    cd ${BASE_DIR}
    nohup ${parse_next_feed} &>> ${LOG_PATH}
    ;;

  *)
    echo "addMaxToQueue|addRecentToQueue|parseNextFeedFromQueue logfile"
    ;;

esac
