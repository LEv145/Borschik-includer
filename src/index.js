import { promises } from "fs";

import { api as borschik_api } from "borschik";
import { file } from "tmp-promise";


export class BorschikIncluder {
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
            const {fd, path, cleanup} = await file()

            await borschik_api({input: source.path, output: path, ...this._opts})

            const contents = await promises.readFile(path, "utf-8")
            source.contents = contents

            cleanup()
        }))

        return sources
    }
}
