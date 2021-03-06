var compressjs = require('compressjs');
var bzip = compressjs.Bzip2;

function FormatAmount(amount) {
    var calculatedAmount = Math.abs(amount) / Math.pow(10, 9);
    var formatted = calculatedAmount.toFixed(9) + "ツ";
    if (amount < 0) {
        formatted = "-" + formatted;
    }

    return formatted;
}

function FormatDateTime(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return date.toLocaleDateString();
    } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            intervalType = "hour";
        } else {
            interval = Math.floor(seconds / 60);
            if (interval >= 1) {
                intervalType = "minute";
            } else {
                interval = seconds;
                intervalType = "second";
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType + ' ago';
}

function Compress(string) {
    var data = new Buffer(string, 'utf8');
    return (new Buffer(bzip.compressFile(data))).toString('base64');
}

function Decompress(string64) {
    const decompressed = bzip.decompressFile(new Buffer(string64, 'base64'));
    return (new Buffer(decompressed)).toString('utf8')
}

export default { FormatAmount, FormatDateTime, Compress, Decompress }