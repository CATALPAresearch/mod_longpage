/*postgres !!*/
CREATE TABLE m_page_bookmark (
    id SERIAL PRIMARY KEY,
    title varchar(255),
    selection varchar(255),
    target varchar(255),
    section varchar(255),
    userid int,
    courseid int,
    pageid int,
    creationdate bigint,
    position int,
    visible int
);

/*postgres !!*/
CREATE TABLE m_page_reading (
    id SERIAL PRIMARY KEY,
    section TEXT,
    sectionoffset int,
    userid int,
    courseid int,
    pageid int,
    creationdate bigint,
);