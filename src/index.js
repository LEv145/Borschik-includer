const fs = require("fs")

const borschik_api = require("borschik").api
const tmp = require("tmp-promise");


class BorschikIncluder {
    /**
     * @param {{
     *      minimize: Boolean
     *      freeze: Boolean
     *      comments: Boolean
     *      tech: String
     *      techOptions: Object
     * }} sources
     */
    constructor({
        minimize=false,
        freeze=true,
        comments=true,
        tech=null,
        techOptions=null,
    } = {}) {
        this._opts = {
            freeze: freeze,
            tech: tech,
            techOptions: techOptions,
            comments: comments,
            minimize: minimize,
        }
    }

    /**
     * @param {{path: String, contents: String}[]} sources
     * @returns {{path: String, contents: String}[]}
     */
    async use(sources){
        await Promise.all(sources.map(async (source) => {
            const {fd, path, cleanup} = await tmp.file()

            await borschik_api({input: source.path, output: path, ...this._opts})

            const contents = await fs.promises.readFile(path, "utf-8")
            source.contents = contents

            cleanup()
        }))

        return sources
    }
}


/**
 * Processes sources.
 *
 * @param {{path: String, contents: String}[]} sources — objects that contain file information.
 * @returns {{path: String, contents: String}[]}
 */
async function processSources(sources) {
    const borschikIncluder = new BorschikIncluder({
        minimize: this._borschikMinimize,
        freeze: this._borschikFreeze,
        comments: this._borschikComments,
        tech: this._borschikTech,
        techOptions: this._borschikTechOptions,
    })
    return await borschikIncluder.use(sources)
}



module.exports = {
    BorschikIncluder: BorschikIncluder,
    processSources: processSources,
}
