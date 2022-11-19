const CronJob = require('cron').CronJob;

import { updateSpeeches } from './jobs'
(async () => {
    const updateSpeechesJob = new CronJob('00 00 03 * * 1-5', await updateSpeeches())
    updateSpeechesJob.start()
})()