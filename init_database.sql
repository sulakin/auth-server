-- PostgreSQL init database dump

CREATE TABLE public.providers (
    id integer NOT NULL,
    name character varying NOT NULL
);

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying NOT NULL,
    type character varying NOT NULL,
    description character varying NOT NULL
);

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    confirm_token character varying,
    is_confirmed boolean DEFAULT false NOT NULL,
    is_blocked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE public.users_has_providers (
    provider_id integer NOT NULL,
    user_id integer NOT NULL
);

CREATE TABLE public.users_has_roles (
    role_id integer NOT NULL,
    user_id integer NOT NULL
);

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

INSERT INTO public.providers VALUES (1, 'google');
INSERT INTO public.providers VALUES (2, 'facebook');
INSERT INTO public.providers VALUES (3, 'vk');

INSERT INTO public.roles VALUES (1, 'Public', 'public', 'Default role');

SELECT pg_catalog.setval('public.providers_id_seq', 1, false);
SELECT pg_catalog.setval('public.roles_id_seq', 1, false);
SELECT pg_catalog.setval('public.users_id_seq', 1, true);


ALTER TABLE ONLY public.users_has_providers
    ADD CONSTRAINT "PK_0a4903c2ef0fab9156626b14152" PRIMARY KEY (provider_id, user_id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);

ALTER TABLE ONLY public.users_has_roles
    ADD CONSTRAINT "PK_ae06eebfe351c872da18b2ef834" PRIMARY KEY (role_id, user_id);

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY (id);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


CREATE INDEX "IDX_306854a701aa47e4db2b5a4659" ON public.users_has_providers USING btree (user_id);

CREATE INDEX "IDX_51a4a8f3129cb25302996edc2b" ON public.users_has_roles USING btree (role_id);

CREATE INDEX "IDX_5e40709b8abf6d02eb8f200c43" ON public.users_has_roles USING btree (user_id);

CREATE INDEX "IDX_696568255ec45f8d5b7d37d9f8" ON public.users_has_providers USING btree (provider_id);


ALTER TABLE ONLY public.users_has_providers
    ADD CONSTRAINT "FK_306854a701aa47e4db2b5a46593" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.users_has_roles
    ADD CONSTRAINT "FK_51a4a8f3129cb25302996edc2b1" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.users_has_roles
    ADD CONSTRAINT "FK_5e40709b8abf6d02eb8f200c43f" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.users_has_providers
    ADD CONSTRAINT "FK_696568255ec45f8d5b7d37d9f81" FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;

-- PostgreSQL init database dump complete
