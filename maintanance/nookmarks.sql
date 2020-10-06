CREATE TABLE m_page_bookmark (
    id int NOT NULL AUTO_INCREMENT,
    title varchar(255),
    selection varchar(255),
    target varchar(255),
    section varchar(255),
    userid int,
    courseid int,
    pageid int,
    creationdate int,
    position int,
    visible int,
    PRIMARY KEY (id)
);


CREATE TABLE m_page_reading (
    id int NOT NULL AUTO_INCREMENT,
    section varchar(255),
    sectionoffset int,
    userid int,
    courseid int,
    pageid int,
    creationdate int,
    PRIMARY KEY (id)
);