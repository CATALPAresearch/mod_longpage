export class User {
    constructor({
        id,
        firstName = '',
        fullName = '',
        lastName = '',
        imageAlt = '',
        profileImage = '',
        profileLink = '',
        roles = [],
    } = {}) {
        this.id = id;
        this.firstName = firstName;
        this.fullName = fullName;
        this.lastName = lastName;
        this.imageAlt = imageAlt;
        this.profileImage = profileImage;
        this.profileLink = profileLink;
        this.roles = roles;
    }
}
