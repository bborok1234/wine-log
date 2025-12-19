SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 1GBBNTeTxu76PPdZjpy7HAbh66MYdj2Wk2YZpBoszJNZdqjFwqRd41abDRrr0sf

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '44603062-e1dc-4f3e-ac26-25777871f366', 'authenticated', 'authenticated', 'bluelves@naver.com', '$2a$10$RAv0t58n3EMx7pcYmpkPJOQf1oyfEpKWVB.d44tDjTG73M1a05x.K', '2025-12-18 09:00:39.561012+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-18 09:01:28.730322+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "44603062-e1dc-4f3e-ac26-25777871f366", "email": "bluelves@naver.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-18 09:00:39.50937+00', '2025-12-18 09:01:28.733982+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'edf3b25a-fbf0-41b2-a4a2-6676b640bc9e', 'authenticated', 'authenticated', 'bborok1234@naver.com', '$2a$10$P/YJrLxKmLBxqQU.M7ZcLeaEwcu7jKZ9viy/Cg1xSZXEdx3JCP3xi', '2025-12-18 05:45:53.948636+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-18 06:54:42.073157+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "edf3b25a-fbf0-41b2-a4a2-6676b640bc9e", "email": "bborok1234@naver.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-18 05:45:53.91618+00', '2025-12-18 06:54:42.145+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', 'authenticated', 'authenticated', 'limmir88@gmail.com', '$2a$10$zNUQSC7lm9QyJ52wO/K6iO4rYWmukpbZw8BOxNgR1pjxik1hhIKgu', '2025-12-17 09:24:58.345873+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-18 13:18:47.2001+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a2b68a61-fbbe-437e-bd3d-2beb6b460054", "email": "limmir88@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-12-17 09:24:58.317006+00', '2025-12-18 13:18:47.213397+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '647161d0-3ed2-4a3d-9d69-a1b119bcec26', 'authenticated', 'authenticated', 'mir@snapvault.io', '$2a$10$IkI33/seTZo8.crFkhZ4pe5i7WU1dlvzpRydM0M3Ym6STA3fQTeZS', '2025-12-18 01:06:41.47747+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-12-18 01:20:37.328498+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "647161d0-3ed2-4a3d-9d69-a1b119bcec26", "email": "mir@snapvault.io", "email_verified": true, "phone_verified": false}', NULL, '2025-12-18 01:06:41.453343+00', '2025-12-18 04:56:22.500619+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('a2b68a61-fbbe-437e-bd3d-2beb6b460054', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '{"sub": "a2b68a61-fbbe-437e-bd3d-2beb6b460054", "email": "limmir88@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-17 09:24:58.340432+00', '2025-12-17 09:24:58.34049+00', '2025-12-17 09:24:58.34049+00', 'b1f327af-5378-4869-b388-d25a8cececff'),
	('647161d0-3ed2-4a3d-9d69-a1b119bcec26', '647161d0-3ed2-4a3d-9d69-a1b119bcec26', '{"sub": "647161d0-3ed2-4a3d-9d69-a1b119bcec26", "email": "mir@snapvault.io", "email_verified": false, "phone_verified": false}', 'email', '2025-12-18 01:06:41.4669+00', '2025-12-18 01:06:41.466966+00', '2025-12-18 01:06:41.466966+00', 'acd8d701-fad6-4948-ab55-99a0dc09874f'),
	('edf3b25a-fbf0-41b2-a4a2-6676b640bc9e', 'edf3b25a-fbf0-41b2-a4a2-6676b640bc9e', '{"sub": "edf3b25a-fbf0-41b2-a4a2-6676b640bc9e", "email": "bborok1234@naver.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-18 05:45:53.941117+00', '2025-12-18 05:45:53.941176+00', '2025-12-18 05:45:53.941176+00', '4d897b08-5fdc-4dbc-8158-7c8a8b45496d'),
	('44603062-e1dc-4f3e-ac26-25777871f366', '44603062-e1dc-4f3e-ac26-25777871f366', '{"sub": "44603062-e1dc-4f3e-ac26-25777871f366", "email": "bluelves@naver.com", "email_verified": false, "phone_verified": false}', 'email', '2025-12-18 09:00:39.553449+00', '2025-12-18 09:00:39.553511+00', '2025-12-18 09:00:39.553511+00', '8819fc30-7a17-4dc0-8116-3ee1817e0bf9');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('d0c8a4ee-64bb-40a7-a37c-2cb65d099910', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 01:06:05.386597+00', '2025-12-18 01:06:05.386597+00', NULL, 'aal1', NULL, NULL, 'node', '13.221.51.11', NULL, NULL, NULL, NULL, NULL),
	('bc91c769-b95d-48da-a68a-736963b4f6a2', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 01:06:06.948261+00', '2025-12-18 01:06:06.948261+00', NULL, 'aal1', NULL, NULL, 'node', '13.221.51.11', NULL, NULL, NULL, NULL, NULL),
	('4ec87850-61a6-4b12-9f96-ecf013b93217', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 01:06:00.115994+00', '2025-12-18 05:57:06.906338+00', NULL, 'aal1', NULL, '2025-12-18 05:57:06.906224', 'node', '18.136.195.112', NULL, NULL, NULL, NULL, NULL),
	('9f4e0446-de3e-46e9-a9e9-06a419d78dfd', '44603062-e1dc-4f3e-ac26-25777871f366', '2025-12-18 09:00:39.570263+00', '2025-12-18 09:00:39.570263+00', NULL, 'aal1', NULL, NULL, 'node', '44.198.50.178', NULL, NULL, NULL, NULL, NULL),
	('d04ee175-1b59-42fc-a392-146a79319b8d', '44603062-e1dc-4f3e-ac26-25777871f366', '2025-12-18 09:01:28.730446+00', '2025-12-18 09:01:28.730446+00', NULL, 'aal1', NULL, NULL, 'node', '44.198.50.178', NULL, NULL, NULL, NULL, NULL),
	('4eb3c365-c103-4b1b-bb42-7f41d0ae2ebf', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 06:03:35.07823+00', '2025-12-18 09:43:39.146909+00', NULL, 'aal1', NULL, '2025-12-18 09:43:39.146777', 'node', '52.77.239.121', NULL, NULL, NULL, NULL, NULL),
	('41fbda47-b28f-47a8-a70e-f9911e489da1', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 06:05:05.39172+00', '2025-12-18 10:04:26.535752+00', NULL, 'aal1', NULL, '2025-12-18 10:04:26.534426', 'node', '47.128.216.45', NULL, NULL, NULL, NULL, NULL),
	('4b214e17-2746-49d2-b763-a5f998968266', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-17 15:38:28.935222+00', '2025-12-18 12:27:39.528605+00', NULL, 'aal1', NULL, '2025-12-18 12:27:39.525289', 'node', '221.151.217.5', NULL, NULL, NULL, NULL, NULL),
	('fba37ea9-ec30-4165-b46e-773890c03672', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 13:12:14.733003+00', '2025-12-18 13:12:14.733003+00', NULL, 'aal1', NULL, NULL, 'node', '221.151.217.5', NULL, NULL, NULL, NULL, NULL),
	('5cad101c-f760-4639-8a00-af0bd67c51ad', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-18 13:18:47.200216+00', '2025-12-18 13:18:47.200216+00', NULL, 'aal1', NULL, NULL, 'node', '221.151.217.5', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('4b214e17-2746-49d2-b763-a5f998968266', '2025-12-17 15:38:28.964133+00', '2025-12-17 15:38:28.964133+00', 'password', '75df0010-3927-4d9c-b9b5-9f9afeb6e63e'),
	('4ec87850-61a6-4b12-9f96-ecf013b93217', '2025-12-18 01:06:00.227473+00', '2025-12-18 01:06:00.227473+00', 'password', '637358af-774c-44fe-b0e5-08601af2fc99'),
	('d0c8a4ee-64bb-40a7-a37c-2cb65d099910', '2025-12-18 01:06:05.392569+00', '2025-12-18 01:06:05.392569+00', 'password', 'c3dc6e11-fb22-4a15-bc1b-e925c0e4c741'),
	('bc91c769-b95d-48da-a68a-736963b4f6a2', '2025-12-18 01:06:06.95349+00', '2025-12-18 01:06:06.95349+00', 'password', '5c679386-71c6-4a2e-aa02-8e9d561d474d'),
	('4eb3c365-c103-4b1b-bb42-7f41d0ae2ebf', '2025-12-18 06:03:35.094828+00', '2025-12-18 06:03:35.094828+00', 'password', 'b56adc9f-5de0-4ee1-a9a2-33281d09f41b'),
	('41fbda47-b28f-47a8-a70e-f9911e489da1', '2025-12-18 06:05:05.395129+00', '2025-12-18 06:05:05.395129+00', 'password', '9dc21275-8968-4afc-be1c-c35bdb61c836'),
	('9f4e0446-de3e-46e9-a9e9-06a419d78dfd', '2025-12-18 09:00:39.611223+00', '2025-12-18 09:00:39.611223+00', 'password', 'cecb1172-4d3e-46b5-9b83-9964f7c65f3d'),
	('d04ee175-1b59-42fc-a392-146a79319b8d', '2025-12-18 09:01:28.734327+00', '2025-12-18 09:01:28.734327+00', 'password', '61539186-448a-449c-8064-c9268368c4b1'),
	('fba37ea9-ec30-4165-b46e-773890c03672', '2025-12-18 13:12:14.766886+00', '2025-12-18 13:12:14.766886+00', 'password', '5ec1d084-aa7a-4aa4-a5b4-e8f996906c63'),
	('5cad101c-f760-4639-8a00-af0bd67c51ad', '2025-12-18 13:18:47.215355+00', '2025-12-18 13:18:47.215355+00', 'password', '92956a28-8074-4374-8bd7-d50c1dcfd347');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 18, '2hs4jym37ta3', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 01:06:05.390439+00', '2025-12-18 01:06:05.390439+00', NULL, 'd0c8a4ee-64bb-40a7-a37c-2cb65d099910'),
	('00000000-0000-0000-0000-000000000000', 19, 'jiqkdxzz4hzy', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 01:06:06.951289+00', '2025-12-18 01:06:06.951289+00', NULL, 'bc91c769-b95d-48da-a68a-736963b4f6a2'),
	('00000000-0000-0000-0000-000000000000', 16, 'lhcehgme7lgc', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-17 15:38:28.952645+00', '2025-12-18 01:10:34.378587+00', NULL, '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 22, 'br4u6ils27mg', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 01:10:34.380483+00', '2025-12-18 02:12:39.182712+00', 'lhcehgme7lgc', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 24, 'b5pavqbeif4j', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 02:12:39.194375+00', '2025-12-18 03:33:59.657276+00', 'br4u6ils27mg', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 26, 'xhmrybawycoz', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 03:33:59.686538+00', '2025-12-18 04:33:41.816169+00', 'b5pavqbeif4j', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 28, 'sndkiyeqjwil', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 04:33:41.828403+00', '2025-12-18 05:37:57.696243+00', 'xhmrybawycoz', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 17, '2p3lhsvruudn', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 01:06:00.170707+00', '2025-12-18 05:57:06.874799+00', NULL, '4ec87850-61a6-4b12-9f96-ecf013b93217'),
	('00000000-0000-0000-0000-000000000000', 32, 'mjrk6u7yphpa', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 05:57:06.8881+00', '2025-12-18 05:57:06.8881+00', '2p3lhsvruudn', '4ec87850-61a6-4b12-9f96-ecf013b93217'),
	('00000000-0000-0000-0000-000000000000', 30, 'mrw6swagoeix', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 05:37:57.710838+00', '2025-12-18 06:40:47.759604+00', 'sndkiyeqjwil', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 34, '7xcy4ghyompj', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 06:05:05.393023+00', '2025-12-18 07:18:59.654721+00', NULL, '41fbda47-b28f-47a8-a70e-f9911e489da1'),
	('00000000-0000-0000-0000-000000000000', 35, 'gw6h26cddj26', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 06:40:47.768027+00', '2025-12-18 08:30:25.082125+00', 'mrw6swagoeix', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 39, 'epj37xudmzkt', '44603062-e1dc-4f3e-ac26-25777871f366', false, '2025-12-18 09:00:39.591401+00', '2025-12-18 09:00:39.591401+00', NULL, '9f4e0446-de3e-46e9-a9e9-06a419d78dfd'),
	('00000000-0000-0000-0000-000000000000', 40, 'qg32ssjxe3hg', '44603062-e1dc-4f3e-ac26-25777871f366', false, '2025-12-18 09:01:28.732344+00', '2025-12-18 09:01:28.732344+00', NULL, 'd04ee175-1b59-42fc-a392-146a79319b8d'),
	('00000000-0000-0000-0000-000000000000', 38, 'dkq3mtd64jaq', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 08:30:25.105429+00', '2025-12-18 09:29:53.669989+00', 'gw6h26cddj26', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 33, 'v5rvbqahozib', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 06:03:35.090137+00', '2025-12-18 09:43:39.13618+00', NULL, '4eb3c365-c103-4b1b-bb42-7f41d0ae2ebf'),
	('00000000-0000-0000-0000-000000000000', 42, 'a26n4winuk5h', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 09:43:39.138509+00', '2025-12-18 09:43:39.138509+00', 'v5rvbqahozib', '4eb3c365-c103-4b1b-bb42-7f41d0ae2ebf'),
	('00000000-0000-0000-0000-000000000000', 37, 'jjgfhtysse5f', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 07:18:59.664504+00', '2025-12-18 10:04:26.486304+00', '7xcy4ghyompj', '41fbda47-b28f-47a8-a70e-f9911e489da1'),
	('00000000-0000-0000-0000-000000000000', 43, 'q4pyyn7hzflp', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 10:04:26.508239+00', '2025-12-18 10:04:26.508239+00', 'jjgfhtysse5f', '41fbda47-b28f-47a8-a70e-f9911e489da1'),
	('00000000-0000-0000-0000-000000000000', 41, 'ndokzw2nc6gf', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', true, '2025-12-18 09:29:53.676393+00', '2025-12-18 12:27:39.47016+00', 'dkq3mtd64jaq', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 44, '5jdvmrr6jmbz', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 12:27:39.500896+00', '2025-12-18 12:27:39.500896+00', 'ndokzw2nc6gf', '4b214e17-2746-49d2-b763-a5f998968266'),
	('00000000-0000-0000-0000-000000000000', 45, 'ay2d2v6lwjqu', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 13:12:14.753572+00', '2025-12-18 13:12:14.753572+00', NULL, 'fba37ea9-ec30-4165-b46e-773890c03672'),
	('00000000-0000-0000-0000-000000000000', 46, 'a7t3sdzrxl5m', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', false, '2025-12-18 13:18:47.208534+00', '2025-12-18 13:18:47.208534+00', NULL, '5cad101c-f760-4639-8a00-af0bd67c51ad');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: houses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."houses" ("id", "name", "created_by", "created_at") VALUES
	('aea4643c-5337-4b34-a6c2-0cc83313ede0', '메인 셀러', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '2025-12-17 09:25:13.237549+00');


--
-- Data for Name: house_invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."house_invites" ("id", "house_id", "token", "role", "expires_at", "created_by", "used_by", "used_at", "created_at") VALUES
	('a7922ac8-bf97-49b0-ac00-930ea3874aae', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '6297c1df6923d06f9d1d6d22b21777a65ad163c7f9367cd93fc6bf85e0e9485a', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 13:59:12.153155+00'),
	('c131548d-d26a-4fd3-a9ae-305a1f402d95', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '39148e50d9ae8c31354306a7c460237c3494f5eefc536b812ce73be726d7eaa1', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 13:59:20.038101+00'),
	('f9c38135-15b4-4a20-98ee-d8fe825a3a4e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '31e213cec6220cdab0647c2534c31b3fc0c9225521d3e70f9d9cfe630506ef96', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 14:00:11.551973+00'),
	('caf1d0c2-75fc-4a2b-aca8-f68fc161e741', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '348b79d66ea7fed3bcb9d2b98e951f6dcee671c1dff351d5f5fc8b88ca37633a', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 14:05:32.43758+00'),
	('0b38e553-3d3c-4ee4-808c-111303718fa9', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '57c3a67e8e8387ce69091250e192c679d1e6ad550ac499b8ec3519d55bc7bb59', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 14:05:49.536003+00'),
	('9f7a98e8-95a1-457c-985c-9d1ad1b61c51', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '89d3d06d687954532016dc6b60572465039ce48ce1dba2b845d6fabf919140eb', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 14:16:15.012694+00'),
	('2b9461f4-8cb7-4c42-9bab-fca4e292e3db', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '6ddc14f1f084fe11f328806bbd980b2be6edd4d5a4cd07a6e8d0066392f23c58', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-17 14:22:02.892618+00'),
	('fd065058-8e56-49bb-9c8f-c6eae44586fe', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7662eb83120bdf6660d476929e8afd298238d9b22aecf264a5cc116cc2f9f770', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 01:06:24.895885+00'),
	('eae3603e-21c1-4790-a946-68bee18e72e3', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '1bc1263791b75d1e8a0c96e493042f982a6bdcde71036ac6d72d85ac1a9e5254', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 01:10:50.722784+00'),
	('613f2eae-c4cc-4d10-9ead-14907480393a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '308da976459c02a00cc29481c4957573db9e759ba2642df9383b5cc6c5ab78b0', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '647161d0-3ed2-4a3d-9d69-a1b119bcec26', '2025-12-18 01:20:38.373139+00', '2025-12-18 01:16:30.524309+00'),
	('b7037219-8357-4b61-a63f-81b55d06b470', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a292e858fbaa5cbdae69848c75718995fcf50c1938aa34ded7efc8f92a678bc6', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 05:18:42.556795+00'),
	('04e48c53-5edc-4f92-8911-2f45d54e864c', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '36a05699b768e779e435d1818a8d5013e6c94cb05d8ad61daa2f24ca7d53495d', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', 'edf3b25a-fbf0-41b2-a4a2-6676b640bc9e', '2025-12-18 05:45:54.84379+00', '2025-12-18 05:45:13.117446+00'),
	('082baaaa-f99a-4aa9-abd0-f95214ce16ec', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '8b4eb25c99d42871c5e1bb8910ddbdf040fb9a9948ed4b38b7bf5c831b5876b6', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 06:09:26.611609+00'),
	('1bd2f928-7e11-4b74-a4a9-b9dbb857ff8a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'cc324c6494391a332d51a163f149c32cd6de4a9e1e22c17cfa6c41c5d6d132ba', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 06:43:27.279121+00'),
	('b6a08f34-7811-4bcb-8341-66a76feda9e8', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'c27adf3c021eb6731c8f56cd6cfd670f88dac5758e2c7059cb19544a9b23eb47', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 06:56:56.427446+00'),
	('890cad21-03a3-416a-895c-89eafb15a9c0', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '88612967df3bbfc4f423926140a2446820b2671801e2c7a57c9d8c323f98c6f4', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 06:58:36.765537+00'),
	('53ad3327-f4bb-4199-8ea9-a56f605c545a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'f1b3478011b0608ae11288d5962580eb67a6ee139b349834a1ab798134dea628', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', NULL, NULL, '2025-12-18 07:03:59.954464+00'),
	('831ef592-0ecf-4784-8bd3-46d5f0c9a0ac', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd824d8126391daefdbadfda85dcf9618d59c009b4bd894934ef0a11c8b48a56e', 'editor', NULL, 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', '44603062-e1dc-4f3e-ac26-25777871f366', '2025-12-18 09:01:32.936534+00', '2025-12-18 06:03:49.003404+00');


--
-- Data for Name: house_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."house_members" ("house_id", "user_id", "role", "created_at") VALUES
	('aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a2b68a61-fbbe-437e-bd3d-2beb6b460054', 'owner', '2025-12-17 09:25:13.237549+00'),
	('aea4643c-5337-4b34-a6c2-0cc83313ede0', '44603062-e1dc-4f3e-ac26-25777871f366', 'editor', '2025-12-18 09:01:32.936534+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "email", "nickname", "joined_at", "created_at", "updated_at") VALUES
	('edf3b25a-fbf0-41b2-a4a2-6676b640bc9e', 'bborok1234@naver.com', '미미', '2025-12-18 05:45:53.91618+00', '2025-12-18 05:45:53.914357+00', '2025-12-18 05:46:23.34625+00'),
	('a2b68a61-fbbe-437e-bd3d-2beb6b460054', 'limmir88@gmail.com', '미르', '2025-12-17 09:24:58.317006+00', '2025-12-18 05:39:54.681767+00', '2025-12-18 07:03:54.828448+00'),
	('44603062-e1dc-4f3e-ac26-25777871f366', 'bluelves@naver.com', NULL, '2025-12-18 09:00:39.50937+00', '2025-12-18 09:00:39.508129+00', '2025-12-18 09:00:39.508129+00');


--
-- Data for Name: wines; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."wines" ("id", "house_id", "producer", "name", "vintage", "country", "region", "type", "stock_qty", "purchase_qty_total", "purchase_value_total", "avg_purchase_price", "rating", "comment", "tasting_review", "label_photo_urls", "created_at", "updated_at", "sommelier_advice", "first_purchased_at", "last_purchased_at") VALUES
	('e9bc6a9e-c2bf-4e41-b17a-85e95229b855', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '펄리셔', '소비뇽 블랑', 2024, '뉴질랜드', '마틴보로', 'white', 1, 1, 23490.000000000000, 23490.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:04.601387+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-08-01', '2025-08-01'),
	('3a83c61c-b1a3-45cb-a3b3-19b9ab1b68f7', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '마츠', '라 헤파', 2021, '스페인', '토로', 'white', 1, 1, 57000.000000000000, 57000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:12.638575+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-09-27', '2024-09-27'),
	('c4a1575a-f3c0-4b8e-8c26-1ab20742867c', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '루체 델라 비테', '브루넬로 디 몬탈치노', 2017, '이탈리아', '몬탈치노', 'red', 1, 1, 139900.000000000000, 139900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:40.602402+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-15', '2024-05-15'),
	('942cf557-7498-4673-89dc-9ffc41d45b50', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '빌라 파니', '바르바레스코', 2019, '이탈리아', '피에몬테', 'red', 1, 1, 75000.000000000000, 75000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:41.114439+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('e38ad831-733f-47d3-97b7-34ea516fb32a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '토마시', '아마로네 델라 발폴리첼라 클라시코', 2020, '이탈리아', '발폴리첼라', 'red', 1, 1, 63840.000000000000, 63840.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:41.621833+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-05-18', '2025-05-18'),
	('2ff52905-994b-4feb-93dc-44a7d6b504ba', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '오르넬라이아', '레 세레 누오베 델 오르넬라이아', 2020, '이탈리아', '볼게리', 'red', 1, 1, 74900.000000000000, 74900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:42.134419+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-16', '2024-05-16'),
	('c422f41d-a644-4814-9b65-a109bf6b476f', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '톨라이니', '발디산티 토스카나', 2020, '이탈리아', '토스카나', 'red', 1, 1, 39000.000000000000, 39000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:42.636861+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-17', '2024-05-17'),
	('35954b99-a4a9-45e6-a5f4-fe160b6d2389', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '쉴드', '소비뇽 블랑', 2024, '뉴질랜드', '넬슨', 'white', 1, 1, 17920.000000000000, 17920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:43.137116+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-03', '2025-11-03'),
	('e454e110-1144-481e-b4a7-76055d7ec8d2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '팔레제', '발폴리첼라 리파소 수페리오레 2015', 2015, '이탈리아', '발폴리첼라', 'red', 1, 1, 62520.000000000000, 62520.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:43.653105+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-12-08', '2025-12-08'),
	('052b06cd-212f-43ee-a8a8-50f38340a720', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '더 피플스', '소비뇽 블랑', 2024, '뉴질랜드', '말보로', 'white', 0, 1, 19920.0000000000000000, 19920.0000000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:05:46.691668+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-14', '2025-11-14'),
	('8baba256-b158-48d6-9c56-55f9d552d67a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '폴 자불레 애네', '크로제 에르미타쥬 뮬 블랑쉬', 2021, '프랑스', '론', 'white', 0, 1, 49900.000000000000, 49900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 04:37:32.744469+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-08', '2025-11-08'),
	('e0c55a15-e9a9-4908-9bb9-b40bc87760c0', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '베스파', '비앙카 떼라 피아노 살렌토', 2024, '이탈리아', '쁄리아', 'white', 2, 3, 39400, 19700.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:05.902716+00', '2025-12-18 10:09:44.878299+00', NULL, '2025-11-14', '2025-11-14'),
	('406fb5c5-d2cb-4df3-8fc5-4179f54d96fb', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '배비치', '패밀리 리저브 소비뇽 블랑', 2025, '뉴질랜드', '말보로', 'white', 1, 1, 16700.000000000000, 16700.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:04.009423+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('357f338a-8a4e-477e-ab84-9939a323807f', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 오즈테르타그', '피노누아 프롱홀즈', 2021, '프랑스', '알자스', 'red', 1, 1, 139000.000000000000, 139000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:25.41571+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('ab5ab077-4adb-46e0-b440-670f851869ef', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '앙드레 끌루에', '상파뉴 브뤼 그랑 리저브', NULL, '프랑스', '상파뉴', 'sparkling', 1, 1, 49500, 49500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:04:29.048631+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-10-18', '2024-10-18'),
	('bdac87a9-f534-4080-a5fa-05c186b632d1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '파사이드 바이 파', '피노누아', 2017, '호주', '질롱', 'red', 1, 1, 76000.000000000000, 76000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:25.907903+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-04', '2025-04-04'),
	('ba11cb7b-a455-4d03-ad4b-7fe7d3049359', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '앙리 지로', '누벨 에스쁘리 나뚜르 G 브뤼', NULL, '프랑스', '상파뉴', 'sparkling', 1, 1, 71280, 71280.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:07:34.603631+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-12-05', '2025-12-05'),
	('ae5c1ecf-3cdc-43df-b76f-8e681bcd79d7', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '무르비에드로', '미스텔라 데 모스카텔', NULL, '스페인', '발렌시아', 'fortified', 1, 1, 20000, 20000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:08:27.587138+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-06-21', '2024-06-21'),
	('8d3b12f7-8d44-4c84-9b28-85facbb4f9bc', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '몰리두커', '블루 아이드 보이', 2021, '호주', '맥라렌 베일', 'red', 0, 1, 49600.000000000000, 49600.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:15:01.162719+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-03', '2024-05-03'),
	('390fc161-dcd9-470c-85cb-94fe0b0aa4e7', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 딸보', '샤또 딸보(4th Grand Cru Classe)', 2015, '프랑스', '생쥴리앙', 'red', 0, 1, 148000.000000000000, 148000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:13:58.778632+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-12-01', '2024-12-01'),
	('41a6390e-6b13-435b-a715-2a8b8c87bcfd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '안 소피 뒤부아', '꼬꼬뜨 프뢰르', 2022, '프랑스', '보졸레', 'red', 0, 1, 51000.000000000000, 51000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 05:12:18.855784+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('a5c3dfa7-ce47-4cf8-a0e4-f91d01a3f683', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '텍스트북', '나파 카베르네 소비뇽', 2021, '미국', '나파밸리', 'red', 3, 3, 135240, 45080.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:29.907223+00', '2025-12-18 09:54:18.608818+00', '{"pairing": "불고기나 양념된 소고기 구이, 김치찌개(매콤한 찌개류), 구운 채소와 치즈 플래터", "description": "진득한 블랙베리와 카시스 향에 오크에서 오는 토스트·바닐라 노트가 더해진 풀바디 와인으로, 탄탄한 탄닌과 긴 스파이시 피니시가 특징입니다.", "servingTemp": "16~18°C", "grapeVariety": "카베르네 소비뇽"}', '2025-11-15', '2025-11-15'),
	('e983e462-a18c-4605-8a6d-5ef67f407e94', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '클라우디 베이', '소비뇽 블랑', 2024, '뉴질랜드', '말보로', 'white', 2, 2, 85120.000000000000, 42560.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:34.558007+00', '2025-12-18 09:54:18.608818+00', '{"pairing": "김치전, 회(광어/연어), 레몬을 곁들인 해산물 샐러드", "description": "생기 있는 시트러스와 열대과일 향이 풍부하고 산도가 선명해 가볍고 깔끔한 바디에 상쾌한 피니시가 남습니다.", "servingTemp": "8~10°C", "grapeVariety": "소비뇽 블랑"}', '2025-05-18', '2025-05-18'),
	('d0fd9f49-30fb-4de6-8d64-3a78e877b8fe', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '하우스 오브 스미스', '와인 오브 섭스턴스 샤도네이', 2019, '미국', '콜롬비아 밸리', 'white', 1, 1, 20860.000000000000, 20860.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:05.109422+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('2b787b91-75e9-49bd-870d-e05415006d35', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '덕혼', '디코이 카베르네 소비뇽', 2022, '미국', '소노마 카운티', 'red', 1, 1, 29000.000000000000, 29000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:06.432225+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('b6b25420-d745-4237-b1ce-ae54db908d85', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 뷰 리발롱', '더 뮤즈 마일즈 데이비스(샤또 뷰 리발롱 생떼밀리옹 그랑크뤼)', 2016, '프랑스', '생떼밀리옹', 'red', 1, 1, 35900.000000000000, 35900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:06.941225+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-22', '2025-11-22'),
	('0734bc86-b53f-429c-a0ff-498c40d67c69', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '카스텔린 빌라', '키안티 클라시코', 2020, '이탈리아', '키안티 클라시코', 'red', 1, 1, 44400.000000000000, 44400.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:07.968155+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-10-24', '2025-10-24'),
	('2151a319-aaa0-4a10-baa5-4aca0aec2352', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '4모노스', 'GR-10 틴토', 2019, '스페인', '비노스 데 마드리드', 'red', 2, 2, 39000.000000000000, 19500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:07.454754+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-20', '2024-07-20'),
	('7a8735e6-f534-4b6e-8381-a20a4bca61c8', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤를르 드 까자노브', '상파뉴 샤를르 드 까자노브 밀레짐', 2013, '프랑스', '상파뉴', 'sparkling', 1, 1, 48300.000000000000, 48300.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:09.529605+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('653dc370-7cf6-47d4-9451-fd6e93bbad82', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '돔 페리뇽', '돔 페리뇽 빈티지', 2013, '프랑스', '상파뉴', 'sparkling', 1, 1, 210300.000000000000, 210300.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:10.06459+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-09-20', '2024-09-20'),
	('8f488369-2037-4258-ba9a-df14c10ac2df', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '앙드레 끌루에', '상파뉴 브뤼 드림 빈티지', 2009, '프랑스', '상파뉴', 'sparkling', 1, 1, 62300.000000000000, 62300.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:10.567523+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-06-21', '2025-06-21'),
	('c6670035-7b63-432e-b2a7-a08a4945abfa', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '파이퍼 하이직', '빈티지', 2014, '프랑스', '상파뉴', 'sparkling', 1, 1, 80930.000000000000, 80930.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:11.088078+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-01', '2024-07-01'),
	('a4805ea2-c24c-4644-8cdf-50acc6a72f52', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '피에르 지모네', '블랑 드 블랑 ''가스트로노메'' 1er Cru', 2016, '프랑스', '상파뉴', 'sparkling', 1, 1, 79520.000000000000, 79520.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:11.607318+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-08-02', '2024-08-02'),
	('d9732abf-69e0-4eb2-bca8-56ea71c7193c', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '앙드레 고이쇼', '샤블리 1er Cru', 2020, '프랑스', '브루고뉴', 'white', 1, 1, 35000.000000000000, 35000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:12.134539+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-04', '2025-04-04'),
	('7b36b348-c43f-40d1-b8ac-3862495066ee', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '올리비에 르플레브', '부르고뉴 몽따니 1er Cru ''본느보''', 2019, '프랑스', '몽따니', 'white', 1, 1, 89920.000000000000, 89920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:13.172522+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-04-01', '2024-04-01'),
	('ef6863c8-74ef-44f6-9f9f-ecceec5ff600', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 소피 시니에', '비레 클레세', 2023, '프랑스', '비레 클레세', 'white', 1, 1, 89000.000000000000, 89000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:13.702658+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('ade64ba9-9ee1-440e-b420-302633bacce1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 드 말리니', '샤블리', 2022, '프랑스', '샤블리', 'white', 1, 1, 41920.000000000000, 41920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:14.224798+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-04-11', '2024-04-11'),
	('ac9566b3-6221-4974-857c-498eda99dcff', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '게릴 패럴', '러시안 리버 셀렉션 샤르도네', 2019, '미국', '러시안 리버 밸리', 'white', 1, 1, 50000.000000000000, 50000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:14.739109+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-09', '2024-05-09'),
	('e00f979d-e040-4c61-be0b-e5965c85215b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '키슬러', '레 누아제티에 샤도네이', 2022, '미국', '소노마 코스트', 'white', 1, 1, 159000.000000000000, 159000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:15.246477+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-11-23', '2024-11-23'),
	('05201260-06d9-4b93-8ff8-8b8b1adb99cd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 다니엘 에띠엔 드페', '샤블리 V.V', 2020, '프랑스', '샤블리', 'white', 1, 1, 59800.000000000000, 59800.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:15.739225+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-01-17', '2025-01-17'),
	('9058d5df-1d46-43c4-8f66-6f65cddcffdd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 드 크레이', '몽타니 1er Cru ''Le cornevent''', 2021, '프랑스', '샤블리', 'white', 1, 1, 36000.000000000000, 36000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:16.26173+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-04', '2025-04-04'),
	('b04de984-79f0-4061-a746-98e6508d8b42', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 앙드레 무앙전', '퓰리니 몽라쉐 1er Cru ''La garenne''', 2019, '프랑스', '퓔리니 몽라셰', 'white', 1, 1, 74500.000000000000, 74500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:16.782634+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-20', '2024-07-20'),
	('4a1bf8d3-9383-4d54-bf7e-32d0e4e94924', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '앙또냉 귀용', '볼네 1er Cru ''끌로 데 셴느''', 2018, '프랑스', '꼬뜨 드 본', 'red', 1, 1, 93200.000000000000, 93200.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:17.294195+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-12-06', '2025-12-06'),
	('32b4b75d-9522-4783-a175-62461c3a5602', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '초크힐', '소노마 코스트 샤도네이', 2022, '미국', '소노마 코스트', 'white', 1, 1, 0, 0.00000000000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:17.806364+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-06-21', '2025-06-21'),
	('3708da1f-a49a-4f5d-8ee2-1f2e87dac752', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 세갱 마뉴엘', '샤샤뉴 몽라쉐 비에이유 비뉴', 2020, '프랑스', '샤샤뉴 몽라셰', 'white', 1, 1, 118800.000000000000, 118800.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:18.320751+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-04', '2025-04-04'),
	('308f18c7-02ce-486a-ab4f-68cf6667313b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '베스파', '일 브루노 데이 베스파 프리미티보 살렌토', 2023, '이탈리아', '쁄리아', 'red', 1, 3, 19700.000000000000, 19700.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:09.00301+00', '2025-12-18 10:10:13.663268+00', NULL, '2025-11-14', '2025-11-14'),
	('a99cbba1-1277-4394-980c-d86ca79bdec1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 드 라 베르제리', '끌로 르 끌로 드 라 베르쥬리', 2022, '프랑스', '루아르>소뮈르', 'white', 1, 1, 58000.000000000000, 58000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:18.850862+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('3564f821-63dc-4a3f-a35b-ac20e28a7b50', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 로버트 드노정', '마콩 빌라쥐 ''레 사르딘''', 2021, '프랑스', '마꽁빌라쥬', 'white', 1, 1, 49920.000000000000, 49920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:19.3472+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-02', '2025-09-02'),
	('bee85559-05e5-4fb2-910f-312b7034737d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '휴먼셀러', '아이네스 스킨 컨택 피노 블랑 에올라 에미티힐스', 2022, '미국', '오레곤', 'white', 1, 1, 59900.000000000000, 59900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:19.863015+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('d7e6363e-749f-40db-9d5c-ab301900a12e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 마르셀 다이스', '알자스 컴플렌테이션', 2022, '프랑스', '알자스', 'white', 1, 1, 29800.000000000000, 29800.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:20.360976+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-02-23', '2025-02-23'),
	('3e93f53a-d905-4eef-8f30-5cd81d3af09f', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '베르테네 에 피스', '몽타니 1er Cru ''생 모릴''', 2021, '프랑스', '몽타니', 'white', 1, 1, 39840.000000000000, 39840.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:20.87122+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-05', '2025-04-05'),
	('51602608-4eef-445e-8f28-88e0bedae65a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 퓨메 샤틀랑', '아르부아 후즈 노 신 투 체프', 2023, '프랑스', '쥐라', 'red', 1, 1, 58000.000000000000, 58000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:21.670514+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('45b939e6-312b-49d6-834c-23433988d35a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '크리스토프 파칼레', '생 따무르', 2022, '프랑스', '생 아무르', 'red', 1, 1, 59000.000000000000, 59000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:22.397528+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('690b7f13-8d0b-4731-ad0b-87d2f4542905', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 제라르 세갱', '샹볼-뮈지니 ''데리에르 르 푸르''', 2019, '프랑스', '샹볼 뮈지니', 'red', 1, 1, 103000.000000000000, 103000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:22.891217+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-15', '2024-07-15'),
	('f4b578cc-3cf0-41a3-b158-ff0720469399', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 슈발리에', '지브리 샹베르탱', 2020, '프랑스', '쥬브레 샹베르탱', 'red', 1, 1, 74950.000000000000, 74950.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:23.408224+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-18', '2024-05-18'),
	('bb07e43b-f979-4a47-8cae-62e5be878ac3', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '알베르 비쇼', '픽생 1er Cru ''끌로 드 라 피에르 모노폴''', 2018, '프랑스', '픽생', 'red', 1, 1, 134500.000000000000, 134500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:23.923398+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-09-20', '2024-09-20'),
	('b4e0f109-4311-4228-b2cd-2a68c221a9d9', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 실뱅 모레이', '샤샤뉴 몽라쉐 루즈 V.V', 2021, '프랑스', '샤샤뉴 몽라셰', 'red', 1, 1, 74950.000000000000, 74950.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:24.422713+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-18', '2024-05-18'),
	('48f66391-6b1b-4f46-ae00-f5ce6504706d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '도멘 샤를로팽 티시에', '쥬브레 샹베르탱 V.V', 2019, '프랑스', '쥬브레 샹베르탱', 'red', 1, 1, 125000.000000000000, 125000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:24.917195+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-04-04', '2025-04-04'),
	('912d3666-eeb0-49d9-8c0f-7f38f4a276a8', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '투핸즈', '홉스 앤 드림스', 2023, '호주', '맥라렌 베일', 'red', 1, 1, 27840.000000000000, 27840.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:08.479427+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('c7abd2fb-e79c-4893-9591-ab7c7c48357d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '투핸즈', '벨라스 가든 쉬라즈', 2020, '호주', '바로사 밸리', 'red', 1, 1, 49500.000000000000, 49500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:26.388324+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-10-18', '2024-10-18'),
	('a645e17e-13c2-4bf4-985b-bb09622ef070', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '케이머스', '캘리포니아 진판델', 2022, '미국', '나파밸리', 'red', 1, 1, 67100.000000000000, 67100.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:26.885474+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-07-19', '2025-07-19'),
	('1e332169-932a-4ff6-8d10-58b5d4e3bb4b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '끌로 뒤 발', '레드 블렌드', 2021, '미국', '캘리포니아', 'red', 1, 1, 42500.000000000000, 42500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:27.38521+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-03-02', '2024-03-02'),
	('de2dc290-094d-4d1f-8115-e7830de9195a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '덕혼', '나파 밸리 멀롯', 2020, '미국', '나파밸리', 'red', 1, 1, 69000.000000000000, 69000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:27.883534+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-09', '2024-05-09'),
	('28793fe0-f4b8-4415-bc52-263fb4a4f407', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '파비아', '레비아탄', 2019, '미국', '캘리포니아', 'red', 1, 1, 60000.000000000000, 60000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:28.376744+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-09', '2024-05-09'),
	('d3789be2-8d9a-41a2-a1be-9bf4c6b2c7da', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '오퍼스 원', '오퍼스 원', 2017, '미국', '캘리포니아', 'red', 1, 1, 545000.000000000000, 545000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:28.880058+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-20', '2024-07-20'),
	('b227975a-301f-4d8d-aed9-a11cd064b697', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '더 프리즈너', '나파 밸리 레드 블렌드', 2019, '미국', '캘리포니아', 'red', 1, 1, 42500.000000000000, 42500.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:29.416472+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-03-02', '2024-03-02'),
	('7afadab7-32f8-488c-b2d4-27bacf4b5883', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '텍스트북', '나파 카베르네 소비뇽', 2018, '미국', '나파밸리', 'red', 1, 1, 47920.000000000000, 47920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:30.41547+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-03-02', '2024-03-02'),
	('b477bd5a-f14d-49b6-be7d-d08318bdb968', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '트라피체', '이스까이 말벡 까베르네 프랑', 2020, '아르헨티나', '멘도사', 'red', 1, 1, 55920.000000000000, 55920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:30.922047+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-01', '2024-05-01'),
	('a33e1d86-df41-432f-b0cf-2d7315f185b7', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '트라피체', '비져너리 싱글빈야드 말벡 ''핀카 암브로시아''', 2021, '아르헨티나', '우코 밸리', 'red', 1, 1, 37000.000000000000, 37000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:31.422772+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-13', '2025-11-13'),
	('895477fb-8d84-45ce-ad56-3cf7d01d9f6b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '트라피체', '비져너리 싱글빈야드 말벡 ''핀카 오렐라나''', 2017, '아르헨티나', '우코 밸리', 'red', 1, 1, 54000.000000000000, 54000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:31.933481+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-05', '2025-09-05'),
	('e0e09eb0-6254-4a53-82f1-44d8b16530d5', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '카테나 자파타', '안젤리카 자파타 말벡', 2019, '아르헨티나', NULL, 'red', 1, 1, 58240.000000000000, 58240.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:32.459775+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-05-18', '2025-05-18'),
	('150baa3f-1be6-481e-85df-005eda3947fd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '비냐 케브라다 드 마쿨', '도무스 어리어', 2022, '칠레', '마이포 밸리', 'red', 1, 1, 100000.000000000000, 100000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:32.964074+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-11-15', '2025-11-15'),
	('b939c0a7-eaa8-4ca2-a7b7-c4b65790b4a2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '콘차 이 토로', '알마비바', 2020, '칠레', '푸엔테 알토', 'red', 1, 1, 197600.000000000000, 197600.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:33.470324+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-17', '2024-05-17'),
	('d792cd0a-2f69-4bcd-aa88-af17a63b0622', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '비냐빅', '밀라칼라', 2021, '칠레', '미야후밸리', 'red', 1, 1, 45320.000000000000, 45320.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:34.057362+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-09-29', '2025-09-29'),
	('162e17de-fab5-4c46-b716-f70cd743f4f4', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '바롱 필립 드 로칠드', '바론 나다니엘 뽀이약', 2018, '프랑스', '뽀이약', 'red', 1, 1, 40000.000000000000, 40000.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:35.058498+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-04-27', '2024-04-27'),
	('7811b626-81eb-44c5-8003-74135581c821', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 딸보', '샤또 딸보(4th Grand Cru Classe)', 2020, '프랑스', '생쥴리앙', 'red', 1, 1, 99200.000000000000, 99200.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:35.546212+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-08-02', '2024-08-02'),
	('7974d29e-bc0e-4233-a6de-037fd7f7c813', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 딸보', '샤또 딸보(4th Grand Cru Classe)', 2021, '프랑스', '생쥴리앙', 'red', 1, 1, 80930.000000000000, 80930.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:36.044363+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-10-02', '2024-10-02'),
	('fa9a15d7-1671-4c32-bd3b-fb9eb54d5639', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 샤스 스플린', '샤또 샤스 스플린', 2021, '프랑스', '물리', 'red', 1, 1, 44920.000000000000, 44920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:36.553474+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-10-04', '2024-10-04'),
	('56447eb1-98bc-42e8-b7a2-96d487dd5190', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 지스꾸르', '샤또 지스꾸르(3rd Grand Cru Classe)', 2021, '프랑스', '마고', 'red', 1, 1, 89920.000000000000, 89920.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:37.064982+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-09-26', '2024-09-26'),
	('caca04d0-bdc3-4aa5-8c8c-5b195ff52443', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 몽로즈', '라 담 드 몽로즈(2nd Grand Cru Classe)', 2015, '프랑스', '생떼스테프', 'red', 1, 1, 84900.000000000000, 84900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:37.609339+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-16', '2024-07-16'),
	('1006b180-9ad9-4a20-be34-ae739ab3f640', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '샤또 라퐁 로쉐', '샤또 라퐁 로쉐(4th Grand Cru Classe)', 2020, '프랑스', '생떼스테프', 'red', 1, 1, 79900.000000000000, 79900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:38.101264+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-07-17', '2024-07-17'),
	('b50fc4d6-5aba-4f3a-9d66-d320d69e5e53', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '마칸', '마칸', 2019, '스페인', '리오하', 'red', 1, 1, 109800.000000000000, 109800.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:38.613901+00', '2025-12-18 09:54:18.608818+00', NULL, '2025-05-18', '2025-05-18'),
	('1acab20c-3d26-4716-98c5-b8876ae3e9b2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '프레스코발디', '카스텔지오콘도 브루넬로 디 몬탈치노', 2018, '이탈리아', '몬탈치노', 'red', 1, 1, 62900.000000000000, 62900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:39.105897+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-11-23', '2024-11-23'),
	('d567a7fc-2b3d-47f4-9732-4902ff395d43', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '산 펠리체', '비고렐로', 2019, '이탈리아', '토스카나', 'red', 1, 1, 50200.000000000000, 50200.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:39.608694+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-06', '2024-05-06'),
	('1069656b-3714-4b08-8f5c-b34728c4b6df', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '루체 델라 비테', '루체', 2017, '이탈리아', '토스카나', 'red', 1, 1, 124900.000000000000, 124900.000000000000, NULL, NULL, NULL, NULL, '2025-12-18 02:14:40.10278+00', '2025-12-18 09:54:18.608818+00', NULL, '2024-05-16', '2024-05-16');


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."purchases" ("id", "house_id", "wine_id", "purchased_at", "store", "unit_price", "quantity", "receipt_photo_url", "created_at") VALUES
	('c81949f0-7813-470a-a708-c01134697d81', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '406fb5c5-d2cb-4df3-8fc5-4179f54d96fb', '2025-11-13', '홈플러스', 16700, 1, NULL, '2025-12-18 02:16:51.366572+00'),
	('4fb265ec-41d9-4ec1-aba2-030a5049a6a4', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e9bc6a9e-c2bf-4e41-b17a-85e95229b855', '2025-08-01', 'GS25', 23490, 1, NULL, '2025-12-18 02:16:51.717021+00'),
	('bff4ee9a-9231-457f-b15f-3fd010ed3627', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd0fd9f49-30fb-4de6-8d64-3a78e877b8fe', '2025-11-13', '이마트', 20860, 1, NULL, '2025-12-18 02:16:52.061806+00'),
	('088e4df9-d11f-4ce5-9dae-ee75c4ccab5b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '2b787b91-75e9-49bd-870d-e05415006d35', '2025-11-13', '홈플러스', 29000, 1, NULL, '2025-12-18 02:16:52.747807+00'),
	('79290316-1663-4834-96d0-8c9f07caaf2f', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b6b25420-d745-4237-b1ce-ae54db908d85', '2025-11-22', 'CU', 35900, 1, NULL, '2025-12-18 02:16:53.103927+00'),
	('2fd76b41-987a-4896-933e-fd2f5a5ecd64', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '2151a319-aaa0-4a10-baa5-4aca0aec2352', '2024-07-20', '오후네시의가게', 19500, 2, NULL, '2025-12-18 02:16:53.740163+00'),
	('4ff6536b-07a7-4925-a225-83c4c1f6b15e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '0734bc86-b53f-429c-a0ff-498c40d67c69', '2025-10-24', '데일리샷', 44400, 1, NULL, '2025-12-18 02:16:54.063286+00'),
	('e54a2933-b957-4903-9dab-e4cec1683cae', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '912d3666-eeb0-49d9-8c0f-7f38f4a276a8', '2025-11-13', '이마트', 27840, 1, NULL, '2025-12-18 02:16:54.703897+00'),
	('de20af7d-b4b8-4c4c-8a84-5ca101809bbc', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7a8735e6-f534-4b6e-8381-a20a4bca61c8', '2025-11-13', '이마트', 48300, 1, NULL, '2025-12-18 02:16:55.364355+00'),
	('f11338da-2dcf-492a-b60a-43503b09c6c3', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '653dc370-7cf6-47d4-9451-fd6e93bbad82', '2024-09-20', '신라면세점', 210300, 1, NULL, '2025-12-18 02:16:55.708997+00'),
	('cca5adfc-da27-4b14-b97f-035ca94d1769', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '8f488369-2037-4258-ba9a-df14c10ac2df', '2025-06-21', '이마트', 62300, 1, NULL, '2025-12-18 02:16:56.051521+00'),
	('6b63a0bf-496c-4f30-8446-bf383a807b90', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'c6670035-7b63-432e-b2a7-a08a4945abfa', '2024-07-01', '세븐일레븐', 80930, 1, NULL, '2025-12-18 02:16:56.377723+00'),
	('101fdbb6-fb68-40d1-8039-82fb14725e6e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a4805ea2-c24c-4644-8cdf-50acc6a72f52', '2024-08-02', '트레이더스', 79520, 1, NULL, '2025-12-18 02:16:56.704249+00'),
	('328ab138-3745-4d43-8ff3-59c8f2c721a2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd9732abf-69e0-4eb2-bca8-56ea71c7193c', '2025-04-04', '몽뱅', 35000, 1, NULL, '2025-12-18 02:16:57.0382+00'),
	('0d053a22-4bd7-4e24-a8dc-7c89d99d572d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '3a83c61c-b1a3-45cb-a3b3-19b9ab1b68f7', '2024-09-27', '몽뱅', 57000, 1, NULL, '2025-12-18 02:16:57.382006+00'),
	('dbeceaf9-7b85-443f-abaa-7c5832b36dd9', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7b36b348-c43f-40d1-b8ac-3862495066ee', '2024-04-01', '세븐일레븐', 89920, 1, NULL, '2025-12-18 02:16:57.713729+00'),
	('6338261d-4c74-40dc-92ba-d01f72f5b0bd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ef6863c8-74ef-44f6-9f9f-ecceec5ff600', '2025-09-05', '라빈리커스토어', 89000, 1, NULL, '2025-12-18 02:16:58.051839+00'),
	('93caddf6-2e68-4150-aa18-410a9592af5e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ade64ba9-9ee1-440e-b420-302633bacce1', '2024-04-11', '세븐일레븐', 41920, 1, NULL, '2025-12-18 02:16:58.389606+00'),
	('a73de485-ec32-40b0-9b69-ec11d6eea441', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ac9566b3-6221-4974-857c-498eda99dcff', '2024-05-09', '몽뱅', 50000, 1, NULL, '2025-12-18 02:16:58.710906+00'),
	('d20ccb1d-8853-43f8-9efc-be3da8613902', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e00f979d-e040-4c61-be0b-e5965c85215b', '2024-11-23', '라빈리커스토어', 159000, 1, NULL, '2025-12-18 02:16:59.080789+00'),
	('5f11f5d8-ca80-4aa7-a8ab-23242eabe467', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '05201260-06d9-4b93-8ff8-8b8b1adb99cd', '2025-01-17', '이마트', 59800, 1, NULL, '2025-12-18 02:16:59.404415+00'),
	('76c8e3a2-9027-4f64-9b7d-4222d7b2423b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '9058d5df-1d46-43c4-8f66-6f65cddcffdd', '2025-04-04', '몽뱅', 36000, 1, NULL, '2025-12-18 02:16:59.73945+00'),
	('defa4430-f65b-4367-a70c-5f97c0ca2459', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b04de984-79f0-4061-a746-98e6508d8b42', '2024-07-20', '오후네시의가게', 74500, 1, NULL, '2025-12-18 02:17:00.068441+00'),
	('20b27263-ad13-487f-9ced-c0be3debacf2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '4a1bf8d3-9383-4d54-bf7e-32d0e4e94924', '2025-12-06', 'GS25', 93200, 1, NULL, '2025-12-18 02:17:00.398039+00'),
	('1ce7b981-9c55-4345-a5a0-7027822545dd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '32b4b75d-9522-4783-a175-62461c3a5602', '2025-06-21', '꼬 선물(신은정)', 0, 1, NULL, '2025-12-18 02:17:00.742101+00'),
	('415ddec0-c2b2-4f39-bbfb-dbc5670c6d59', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '3708da1f-a49a-4f5d-8ee2-1f2e87dac752', '2025-04-04', '몽뱅', 118800, 1, NULL, '2025-12-18 02:17:01.079306+00'),
	('0b9cb0e2-3747-49df-bee1-3ef467725983', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a99cbba1-1277-4394-980c-d86ca79bdec1', '2025-09-05', '라빈리커스토어', 58000, 1, NULL, '2025-12-18 02:17:01.433176+00'),
	('b6d71d49-883a-45d8-8cbd-cd064dc995c8', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '3564f821-63dc-4a3f-a35b-ac20e28a7b50', '2025-09-02', '세븐일레븐', 49920, 1, NULL, '2025-12-18 02:17:01.765681+00'),
	('b3221279-5a98-4a9d-9876-73297773092d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'bee85559-05e5-4fb2-910f-312b7034737d', '2025-09-05', '라빈리커스토어', 59900, 1, NULL, '2025-12-18 02:17:02.118695+00'),
	('dc34bd95-dba8-4219-8ba8-31c00eaeb07a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd7e6363e-749f-40db-9d5c-ab301900a12e', '2025-02-23', '이마트', 29800, 1, NULL, '2025-12-18 02:17:02.441932+00'),
	('e2ac05a4-be51-4741-b4f3-c355315ab0bd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '3e93f53a-d905-4eef-8f30-5cd81d3af09f', '2025-04-05', '이마트', 39840, 1, NULL, '2025-12-18 02:17:02.789211+00'),
	('785a5f31-301c-43da-b12b-348a5b3b80a1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '51602608-4eef-445e-8f28-88e0bedae65a', '2025-09-05', '라빈리커스토어', 58000, 1, NULL, '2025-12-18 02:17:03.137349+00'),
	('edc3d568-08b2-4f45-a05f-58d86db43b04', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '45b939e6-312b-49d6-834c-23433988d35a', '2025-09-05', '라빈리커스토어', 59000, 1, NULL, '2025-12-18 02:17:03.456862+00'),
	('602fd32c-92fb-4b7d-bd8f-a2bb38645575', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '690b7f13-8d0b-4731-ad0b-87d2f4542905', '2024-07-15', '위클리와인', 103000, 1, NULL, '2025-12-18 02:17:03.792614+00'),
	('fc408643-a169-4dd7-bb9f-ce61834bf19d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'f4b578cc-3cf0-41a3-b158-ff0720469399', '2024-05-18', '라빈리커스토어', 74950, 1, NULL, '2025-12-18 02:17:04.135109+00'),
	('9b5a99b5-b11a-4fba-abd5-8abd4112d6ab', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'bb07e43b-f979-4a47-8cae-62e5be878ac3', '2024-09-20', '신라면세점', 134500, 1, NULL, '2025-12-18 02:17:04.473896+00'),
	('860430d3-bc0a-41aa-bb88-b68b75aa49a5', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b4e0f109-4311-4228-b2cd-2a68c221a9d9', '2024-05-18', '라빈리커스토어', 74950, 1, NULL, '2025-12-18 02:17:04.809141+00'),
	('e27b1463-7c6c-4072-916a-c745fd8e59a4', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '48f66391-6b1b-4f46-ae00-f5ce6504706d', '2025-04-04', '몽뱅', 125000, 1, NULL, '2025-12-18 02:17:05.141992+00'),
	('8889af93-bef0-42f6-83ce-af4a92180366', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '357f338a-8a4e-477e-ab84-9939a323807f', '2025-09-05', '라빈리커스토어', 139000, 1, NULL, '2025-12-18 02:17:05.49451+00'),
	('255cce14-8897-4d27-813b-f36393e22956', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'bdac87a9-f534-4080-a5fa-05c186b632d1', '2025-04-04', '몽뱅', 76000, 1, NULL, '2025-12-18 02:17:05.8258+00'),
	('17c4b445-a2d4-4770-840e-2a79d1452603', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'c7abd2fb-e79c-4893-9591-ab7c7c48357d', '2024-10-18', '이마트', 49500, 1, NULL, '2025-12-18 02:17:06.151647+00'),
	('8c18b3fc-540d-40da-b81b-9763cd0c6a97', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a645e17e-13c2-4bf4-985b-bb09622ef070', '2025-07-19', 'GS25', 67100, 1, NULL, '2025-12-18 02:17:06.480541+00'),
	('24bc49b5-8980-4089-900a-073ce068b02d', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '1e332169-932a-4ff6-8d10-58b5d4e3bb4b', '2024-03-02', '떼루아', 42500, 1, NULL, '2025-12-18 02:17:06.80151+00'),
	('aa26b319-f4b6-448e-8820-00672268bdad', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'de2dc290-094d-4d1f-8115-e7830de9195a', '2024-05-09', '몽뱅', 69000, 1, NULL, '2025-12-18 02:17:07.152282+00'),
	('2272aa0b-f3d9-489c-9b62-361520c73925', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '28793fe0-f4b8-4415-bc52-263fb4a4f407', '2024-05-09', '몽뱅', 60000, 1, NULL, '2025-12-18 02:17:07.487008+00'),
	('be126347-7649-4171-8e9d-08aa5e2fa0fd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd3789be2-8d9a-41a2-a1be-9bf4c6b2c7da', '2024-07-20', '오후네시의가게', 545000, 1, NULL, '2025-12-18 02:17:07.817499+00'),
	('91bd97db-59f6-4c95-97d2-148b8d4f765e', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b227975a-301f-4d8d-aed9-a11cd064b697', '2024-03-02', '떼루아', 42500, 1, NULL, '2025-12-18 02:17:08.160115+00'),
	('3d69be34-e017-4dbd-be93-99c1c7261405', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a5c3dfa7-ce47-4cf8-a0e4-f91d01a3f683', '2025-11-15', '홈플러스', 45900, 3, NULL, '2025-12-18 02:17:08.498611+00'),
	('076f322f-16fe-47fc-b779-6d519110f470', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7afadab7-32f8-488c-b2d4-27bacf4b5883', '2024-03-02', '홈플러스', 47920, 1, NULL, '2025-12-18 02:17:08.822011+00'),
	('b45e573c-ea5d-4370-b6c3-92b3bff4c81b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b477bd5a-f14d-49b6-be7d-d08318bdb968', '2024-05-01', '세븐일레븐', 55920, 1, NULL, '2025-12-18 02:17:09.158975+00'),
	('381da272-d7ae-4598-8bc0-012e7b20c57b', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'a33e1d86-df41-432f-b0cf-2d7315f185b7', '2025-11-13', '홈플러스', 37000, 1, NULL, '2025-12-18 02:17:09.488001+00'),
	('135a22aa-a572-4aea-8261-061e280ca9c4', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '895477fb-8d84-45ce-ad56-3cf7d01d9f6b', '2025-09-05', '라빈리커스토어', 54000, 1, NULL, '2025-12-18 02:17:09.82152+00'),
	('c4ce8de4-b453-443f-883f-09a49fec01e2', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e0e09eb0-6254-4a53-82f1-44d8b16530d5', '2025-05-18', '이마트', 58240, 1, NULL, '2025-12-18 02:17:10.143291+00'),
	('f20497f7-4507-45ab-95c5-41be16d2edf9', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '150baa3f-1be6-481e-85df-005eda3947fd', '2025-11-15', '홈플러스', 100000, 1, NULL, '2025-12-18 02:17:10.472205+00'),
	('2dab34b8-395e-44b4-a629-456b67173af1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b939c0a7-eaa8-4ca2-a7b7-c4b65790b4a2', '2024-05-17', '이마트', 197600, 1, NULL, '2025-12-18 02:17:10.836449+00'),
	('2c84deca-49fc-4b1a-879c-bc1c88eed0a1', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd792cd0a-2f69-4bcd-aa88-af17a63b0622', '2025-09-29', 'GS25', 45320, 1, NULL, '2025-12-18 02:17:11.153348+00'),
	('ac239bbc-cb9d-48de-a156-f119f660c113', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e983e462-a18c-4605-8a6d-5ef67f407e94', '2025-05-18', '이마트', 42560, 2, NULL, '2025-12-18 02:17:11.499486+00'),
	('30855180-9ac2-4f18-aeb8-bf52330010f0', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '162e17de-fab5-4c46-b716-f70cd743f4f4', '2024-04-27', 'GS25', 40000, 1, NULL, '2025-12-18 02:17:11.834998+00'),
	('3b79ee42-651c-46a4-9087-3a0d1867322a', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7811b626-81eb-44c5-8003-74135581c821', '2024-08-02', '이마트', 99200, 1, NULL, '2025-12-18 02:17:12.169002+00'),
	('43deb0a2-5413-47c4-9044-3055faa2b8b6', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e0c55a15-e9a9-4908-9bb9-b40bc87760c0', '2025-11-14', 'GS25', 19700, 3, NULL, '2025-12-18 02:16:52.401835+00'),
	('185e0b0b-12ee-4b57-8fed-4fb9bf2e7bfc', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '308f18c7-02ce-486a-ab4f-68cf6667313b', '2025-11-14', 'GS25', 19700, 3, NULL, '2025-12-18 02:16:55.034976+00'),
	('d88d5dd7-aede-4e26-b268-524f06f03d71', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '7974d29e-bc0e-4233-a6de-037fd7f7c813', '2024-10-02', '세븐일레븐', 80930, 1, NULL, '2025-12-18 02:17:12.514751+00'),
	('0820096d-4f5d-4aeb-bd5f-1a6c5385df29', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'fa9a15d7-1671-4c32-bd3b-fb9eb54d5639', '2024-10-04', '세븐일레븐', 44920, 1, NULL, '2025-12-18 02:17:12.869893+00'),
	('5f5350e4-3566-48b6-99e7-6dd5c852e3a3', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '56447eb1-98bc-42e8-b7a2-96d487dd5190', '2024-09-26', '세븐일레븐', 89920, 1, NULL, '2025-12-18 02:17:13.213448+00'),
	('20d96125-a284-4e14-bc03-525689577e75', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'caca04d0-bdc3-4aa5-8c8c-5b195ff52443', '2024-07-16', '라빈리커스토어', 84900, 1, NULL, '2025-12-18 02:17:13.550493+00'),
	('78de8d5a-3a62-458e-804f-ea90899f7869', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '1006b180-9ad9-4a20-be34-ae739ab3f640', '2024-07-17', '와인이야기', 79900, 1, NULL, '2025-12-18 02:17:13.90293+00'),
	('57c9a868-f3f7-4fd6-b66e-6e8c9ef0b190', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'b50fc4d6-5aba-4f3a-9d66-d320d69e5e53', '2025-05-18', '이마트', 109800, 1, NULL, '2025-12-18 02:17:14.247005+00'),
	('36ae99ad-3f34-4280-a42a-94e06cc1a150', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '1acab20c-3d26-4716-98c5-b8876ae3e9b2', '2024-11-23', '라빈리커스토어', 62900, 1, NULL, '2025-12-18 02:17:14.584336+00'),
	('915d4934-ebca-45d8-a811-78ae5b069784', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'd567a7fc-2b3d-47f4-9732-4902ff395d43', '2024-05-06', '홈플러스', 50200, 1, NULL, '2025-12-18 02:17:14.923895+00'),
	('35a5dc7b-fcf7-455d-b213-83eab2d089e0', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '1069656b-3714-4b08-8f5c-b34728c4b6df', '2024-05-16', '라빈리커스토어', 124900, 1, NULL, '2025-12-18 02:17:15.263836+00'),
	('3d67fba2-0cd9-4baa-8141-a0ad069aedf9', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'c4a1575a-f3c0-4b8e-8c26-1ab20742867c', '2024-05-15', '라빈리커스토어', 139900, 1, NULL, '2025-12-18 02:17:15.589879+00'),
	('51bdc46a-257a-497a-9bfb-f34a0b6fa298', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '942cf557-7498-4673-89dc-9ffc41d45b50', '2025-09-05', '라빈리커스토어', 75000, 1, NULL, '2025-12-18 02:17:15.928402+00'),
	('53d920b7-f7c7-489b-a3ea-b20ff78eec75', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e38ad831-733f-47d3-97b7-34ea516fb32a', '2025-05-18', '이마트', 63840, 1, NULL, '2025-12-18 02:17:16.267099+00'),
	('9cb60d23-76ff-4c43-8132-7b9ed13eaa45', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '2ff52905-994b-4feb-93dc-44a7d6b504ba', '2024-05-16', '라빈리커스토어', 74900, 1, NULL, '2025-12-18 02:17:16.610756+00'),
	('f651bfe9-9dba-4eac-8d56-710fde32e9ad', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'c422f41d-a644-4814-9b65-a109bf6b476f', '2024-05-17', '이마트', 39000, 1, NULL, '2025-12-18 02:17:16.943892+00'),
	('65ccca0e-abaf-43c7-bffe-34271e2ad3d5', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '35954b99-a4a9-45e6-a5f4-fe160b6d2389', '2025-11-03', 'GS25', 17920, 1, NULL, '2025-12-18 02:17:17.311496+00'),
	('c334788c-3a18-4ccb-874e-bdf7d6b5a9bd', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'e454e110-1144-481e-b4a7-76055d7ec8d2', '2025-12-08', 'GS25', 62520, 1, NULL, '2025-12-18 02:17:17.649629+00'),
	('329d6d03-4a96-4575-ae13-62d2f6efce25', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '8baba256-b158-48d6-9c56-55f9d552d67a', '2025-11-08', '이플러스마트', 49900, 1, NULL, '2025-12-18 04:37:32.98071+00'),
	('f4d3adc2-5ce3-42e3-88bb-aa6324c90f24', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ab5ab077-4adb-46e0-b440-670f851869ef', '2024-10-18', '이마트', 49500, 1, NULL, '2025-12-18 05:04:29.27559+00'),
	('320d3cf4-76ac-4bcd-b647-1b016547e47c', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '052b06cd-212f-43ee-a8a8-50f38340a720', '2025-11-14', '세븐일레븐', 19920, 1, NULL, '2025-12-18 05:05:46.904668+00'),
	('77fb2555-3786-4b0f-837a-a1be0b139c77', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ba11cb7b-a455-4d03-ad4b-7fe7d3049359', '2025-12-05', 'GS25', 71280, 1, NULL, '2025-12-18 05:07:34.84169+00'),
	('0f7176ff-37f1-4575-8712-74af752515cc', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', 'ae5c1ecf-3cdc-43df-b76f-8e681bcd79d7', '2024-06-21', '몽뱅', 20000, 1, NULL, '2025-12-18 05:08:27.795233+00'),
	('493699ba-c4ec-47c6-a418-7831b9b5b7c0', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '41a6390e-6b13-435b-a715-2a8b8c87bcfd', '2025-09-05', '라빈리커스토어', 51000, 1, NULL, '2025-12-18 05:12:19.162365+00'),
	('de21f8c6-90fb-401b-ab2f-2a8cd11592cc', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '390fc161-dcd9-470c-85cb-94fe0b0aa4e7', '2024-12-01', 'GS25', 148000, 1, NULL, '2025-12-18 05:13:59.003933+00'),
	('2a2365ef-b4e0-4518-b590-8456e2e59a16', 'aea4643c-5337-4b34-a6c2-0cc83313ede0', '8d3b12f7-8d44-4c84-9b28-85facbb4f9bc', '2024-05-03', '홈플러스', 49600, 1, NULL, '2025-12-18 05:15:01.376365+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 46, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict 1GBBNTeTxu76PPdZjpy7HAbh66MYdj2Wk2YZpBoszJNZdqjFwqRd41abDRrr0sf

RESET ALL;
