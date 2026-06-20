export class BaseProvider {
    /**
     * @param {ArrayObject>} messages
     * @param {string} model
     * @returns {Promise<string}
     */

    async invoke(message, model) {
        throw new Error('Method invoke must be implemented natively.')
    }

    /**
     * @returns {Promise<Array<string>>}
     */
    async getModels() {
        throw new Error('Method getModels must be implemented natively.')
    }
}
