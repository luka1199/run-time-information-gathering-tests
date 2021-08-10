if (!process.argv[2]) {
    console.log("No url specified.")
    process.exit()
}

const repoUrl = process.argv[2]
var regex = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/
var match = repoUrl.match(regex)
var newUrl = repoUrl.replace(`${match[2]}://`, "https://")
console.log(newUrl)