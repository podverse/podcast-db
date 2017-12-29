--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.6
-- Dumped by pg_dump version 9.6.1


--
-- Name: episodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE episodes (
    id text NOT NULL,
    "mediaUrl" text,
    "imageUrl" text,
    title text,
    summary text,
    duration integer,
    link text,
    "mediaBytes" integer,
    "mediaType" text,
    "pubDate" timestamp with time zone,
    "isPublic" boolean DEFAULT false,
    "pastHourTotalUniquePageviews" integer DEFAULT 0,
    "pastDayTotalUniquePageviews" integer DEFAULT 0,
    "pastWeekTotalUniquePageviews" integer DEFAULT 0,
    "pastMonthTotalUniquePageviews" integer DEFAULT 0,
    "pastYearTotalUniquePageviews" integer DEFAULT 0,
    "allTimeTotalUniquePageviews" integer DEFAULT 0,
    "dateCreated" timestamp with time zone NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL,
    "podcastId" text
);


--
-- Name: feedUrls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "feedUrls" (
    url text NOT NULL,
    "isAuthority" boolean,
    "dateCreated" timestamp with time zone NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL,
    "podcastId" text
);


--
-- Name: podcasts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE podcasts (
    id text NOT NULL,
    "imageUrl" text,
    summary text,
    title text,
    author text,
    "lastBuildDate" timestamp with time zone,
    "lastPubDate" timestamp with time zone,
    "lastEpisodeTitle" text,
    "totalAvailableEpisodes" integer,
    categories text[] DEFAULT ARRAY[]::text[],
    "pastHourTotalUniquePageviews" integer DEFAULT 0,
    "pastDayTotalUniquePageviews" integer DEFAULT 0,
    "pastWeekTotalUniquePageviews" integer DEFAULT 0,
    "pastMonthTotalUniquePageviews" integer DEFAULT 0,
    "pastYearTotalUniquePageviews" integer DEFAULT 0,
    "allTimeTotalUniquePageviews" integer DEFAULT 0,
    "dateCreated" timestamp with time zone NOT NULL,
    "lastUpdated" timestamp with time zone NOT NULL
);


--
-- Name: episodes episodes_mediaUrl_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY episodes
    ADD CONSTRAINT "episodes_mediaUrl_key" UNIQUE ("mediaUrl");


--
-- Name: episodes episodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY episodes
    ADD CONSTRAINT episodes_pkey PRIMARY KEY (id);


--
-- Name: feedUrls feedUrls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "feedUrls"
    ADD CONSTRAINT "feedUrls_pkey" PRIMARY KEY (url);


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
-- Name: feedUrls feedUrls_podcastId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "feedUrls"
    ADD CONSTRAINT "feedUrls_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES podcasts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--
