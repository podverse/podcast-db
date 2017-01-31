--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.0
-- Dumped by pg_dump version 9.6.1


--
-- Name: episodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE episodes (
    id uuid NOT NULL,
    "mediaURL" text,
    "imageURL" text,
    title text,
    summary text,
    duration integer,
    link text,
    "mediaBytes" integer,
    "mediaType" text,
    "pubDate" timestamp with time zone,
    "dateCreated" timestamp with time zone NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL,
    "podcastId" uuid
);

--
-- Name: podcasts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE podcasts (
    id uuid NOT NULL,
    "feedURL" text,
    "imageURL" text,
    summary text,
    title text,
    author text,
    "lastBuildDate" timestamp with time zone,
    "lastPubDate" timestamp with time zone,
    "dateCreated" timestamp with time zone NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL
);


--
-- Name: episodes episodes_mediaURL_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY episodes
    ADD CONSTRAINT "episodes_mediaURL_key" UNIQUE ("mediaURL");


--
-- Name: episodes episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY episodes
    ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);


--
-- Name: podcasts podcasts_feedURL_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY podcasts
    ADD CONSTRAINT "podcasts_feedURL_key" UNIQUE ("feedURL");


--
-- Name: podcasts podcasts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY podcasts
    ADD CONSTRAINT podcasts_pkey PRIMARY KEY (id);


--
-- Name: episodes episodes_podcastId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY episodes
    ADD CONSTRAINT "episodes_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES podcasts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

