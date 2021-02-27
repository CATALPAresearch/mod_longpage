export class UserRole {
    constructor({
        id,
        localName = '',
        shortName = '',
    }) {
        this.id = id;
        this.localName = localName;
        this.shortName = shortName;
    }
}
