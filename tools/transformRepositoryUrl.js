if (!process.argv[2]) {
    console.log("No url specified.")
    process.exit()
}

const repoUrl = process.argv[2]
var newUrl = repoUrl.replace("git+https://", "git://").replace("https://", `git://`)
console.log(newUrl)