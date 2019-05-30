const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const slack = require('slack-notify')(SLACK_WEBHOOK_URL);
const ENV = process.env.NODE_ENV || 'local';


class Slack {

    static sendInfo(message, channel = '#one') {
        slack.send({
            channel: channel,
            text: message
        })
    }

    static sendAlert(text) {
        slack.alert({
            channel: "#one",
            text: `ALERT: ${text}`
        })
    }

    static sendWarning(text) {
        slack.bug({
            channel: "#one",
            text: `Need Desigion: ${text}`
        });
    }

}

module.exports = Slack;