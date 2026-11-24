--
-- PostgreSQL database dump
--

\restrict ZSSOBkStG7yN4i9rz5W5k0EEqKGO7kqPXeYg6dEUDxo56q8tx7LuaAIrYDvpnsa

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AMCStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AMCStatus" AS ENUM (
    'active',
    'expired',
    'cancelled',
    'pending_renewal'
);


--
-- Name: AchievementCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AchievementCategory" AS ENUM (
    'infrastructure',
    'finance',
    'community',
    'legal',
    'safety',
    'other'
);


--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'operational',
    'under_maintenance',
    'out_of_service'
);


--
-- Name: AssetType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetType" AS ENUM (
    'lift',
    'borewell',
    'water_tank',
    'generator',
    'other'
);


--
-- Name: BillStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BillStatus" AS ENUM (
    'unpaid',
    'paid',
    'overdue'
);


--
-- Name: BlockType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BlockType" AS ENUM (
    'flats',
    'rowhouses',
    'mixed'
);


--
-- Name: CommitteeDesignation; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommitteeDesignation" AS ENUM (
    'president',
    'vice_president',
    'secretary',
    'joint_secretary',
    'treasurer',
    'joint_treasurer',
    'member',
    'advisor'
);


--
-- Name: ComplaintCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComplaintCategory" AS ENUM (
    'maintenance',
    'noise',
    'cleanliness',
    'security',
    'billing',
    'other'
);


--
-- Name: ComplaintStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComplaintStatus" AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed'
);


--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventStatus" AS ENUM (
    'planning',
    'active',
    'completed',
    'cancelled'
);


--
-- Name: FlatStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FlatStatus" AS ENUM (
    'occupied',
    'vacant'
);


--
-- Name: FlatType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FlatType" AS ENUM (
    'flat',
    'single',
    'duplex',
    'triplex',
    'bungalow',
    'penthouse'
);


--
-- Name: HelperCategory; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."HelperCategory" AS ENUM (
    'electrician',
    'plumber',
    'carpenter',
    'ac_service',
    'motor_binding',
    'generator_service',
    'painting',
    'pest_control',
    'housekeeping',
    'security_service',
    'other'
);


--
-- Name: IncomeSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IncomeSource" AS ENUM (
    'sponsorship',
    'advertisement',
    'event',
    'rental',
    'donation',
    'other'
);


--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'draft',
    'sent',
    'paid',
    'cancelled'
);


--
-- Name: NoticePriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NoticePriority" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


--
-- Name: PaymentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMode" AS ENUM (
    'cash',
    'upi',
    'bank_transfer',
    'cheque'
);


--
-- Name: PermissionModule; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PermissionModule" AS ENUM (
    'billing',
    'residents',
    'flats',
    'visitors',
    'notices',
    'complaints',
    'staff',
    'assets',
    'parking',
    'expenses',
    'income',
    'invoices',
    'events',
    'vendors',
    'committee',
    'helpers',
    'settings',
    'users',
    'reports'
);


--
-- Name: ResidentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResidentType" AS ENUM (
    'owner',
    'tenant'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'admin',
    'owner',
    'tenant',
    'security',
    'sub_admin',
    'member'
);


--
-- Name: SocietyStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SocietyStatus" AS ENUM (
    'pending',
    'setup',
    'active',
    'suspended'
);


--
-- Name: VehicleType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VehicleType" AS ENUM (
    'car',
    'bike',
    'scooter',
    'other'
);


--
-- Name: VisitorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."VisitorType" AS ENUM (
    'guest',
    'delivery',
    'milkman',
    'service',
    'plumber',
    'electrician',
    'dth',
    'broadband',
    'solar',
    'gas',
    'cab',
    'courier',
    'other'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: amc_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.amc_contracts (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    "vendorId" text NOT NULL,
    "assetId" text,
    "contractNumber" text,
    "serviceType" text NOT NULL,
    "annualCost" double precision NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "serviceFrequencyDays" integer DEFAULT 90 NOT NULL,
    "lastServiceDate" timestamp(3) without time zone,
    "nextServiceDue" timestamp(3) without time zone,
    status public."AMCStatus" DEFAULT 'active'::public."AMCStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: amc_service_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.amc_service_logs (
    id text NOT NULL,
    "contractId" text NOT NULL,
    "serviceDate" timestamp(3) without time zone NOT NULL,
    "technicianName" text,
    "workDone" text NOT NULL,
    "serviceCost" double precision,
    "nextServiceDue" timestamp(3) without time zone,
    remarks text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id text NOT NULL,
    name text NOT NULL,
    type public."AssetType" NOT NULL,
    status public."AssetStatus" DEFAULT 'operational'::public."AssetStatus" NOT NULL,
    location text,
    "lastServiceDate" timestamp(3) without time zone,
    "nextServiceDue" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL
);


--
-- Name: blacklisted_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blacklisted_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blocks (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    description text,
    "blockType" public."BlockType" DEFAULT 'flats'::public."BlockType" NOT NULL,
    "totalFloors" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: committee_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_achievements (
    id text NOT NULL,
    "committeeId" text NOT NULL,
    title text NOT NULL,
    description text,
    "achievedOn" timestamp(3) without time zone NOT NULL,
    category public."AchievementCategory" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: committee_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_members (
    id text NOT NULL,
    "committeeId" text NOT NULL,
    "residentId" text NOT NULL,
    designation public."CommitteeDesignation" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "joinedOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "leftOn" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    "formedOn" timestamp(3) without time zone NOT NULL,
    "dissolvedOn" timestamp(3) without time zone,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id text NOT NULL,
    "flatId" text NOT NULL,
    "raisedBy" text,
    category public."ComplaintCategory" NOT NULL,
    description text NOT NULL,
    status public."ComplaintStatus" DEFAULT 'open'::public."ComplaintStatus" NOT NULL,
    "adminRemark" text,
    "raisedOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "resolvedOn" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: event_contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_contributions (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "contributorName" text NOT NULL,
    "flatId" text,
    amount double precision NOT NULL,
    "paymentMode" public."PaymentMode" DEFAULT 'cash'::public."PaymentMode" NOT NULL,
    "paidOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: event_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_expenses (
    id text NOT NULL,
    "eventId" text NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    amount double precision NOT NULL,
    "paidOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vendor text,
    notes text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: event_team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_team_members (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "residentId" text NOT NULL,
    role text NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    description text,
    "eventDate" timestamp(3) without time zone NOT NULL,
    status public."EventStatus" DEFAULT 'planning'::public."EventStatus" NOT NULL,
    "budgetTarget" double precision,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: expense_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_categories (
    id integer NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    color text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: expense_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.expense_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: expense_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.expense_categories_id_seq OWNED BY public.expense_categories.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    title text NOT NULL,
    amount double precision NOT NULL,
    "paidOn" timestamp(3) without time zone NOT NULL,
    vendor text,
    notes text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    category text NOT NULL
);


--
-- Name: family_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.family_members (
    id text NOT NULL,
    "residentId" text NOT NULL,
    name text NOT NULL,
    relation text NOT NULL,
    phone text,
    "dateOfBirth" timestamp(3) without time zone,
    "isEmergency" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: flats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flats (
    id text NOT NULL,
    "flatNumber" text NOT NULL,
    floor integer,
    type public."FlatType" DEFAULT 'flat'::public."FlatType" NOT NULL,
    "sqFt" double precision NOT NULL,
    status public."FlatStatus" DEFAULT 'vacant'::public."FlatStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL,
    "blockId" text
);


--
-- Name: helpers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.helpers (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    "alternatePhone" text,
    email text,
    category public."HelperCategory" NOT NULL,
    description text,
    "photoUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "addedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: income_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.income_records (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    title text NOT NULL,
    source public."IncomeSource" NOT NULL,
    amount double precision NOT NULL,
    "receivedOn" timestamp(3) without time zone NOT NULL,
    payer text,
    notes text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    description text NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    "unitPrice" double precision NOT NULL,
    amount double precision NOT NULL
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    "invoiceNumber" text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'draft'::public."InvoiceStatus" NOT NULL,
    "fromName" text NOT NULL,
    "fromAddress" text,
    "fromPhone" text,
    "fromEmail" text,
    "toName" text NOT NULL,
    "toAddress" text,
    "toPhone" text,
    "toEmail" text,
    "invoiceDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dueDate" timestamp(3) without time zone,
    subtotal double precision DEFAULT 0 NOT NULL,
    "taxRate" double precision DEFAULT 0 NOT NULL,
    "taxAmount" double precision DEFAULT 0 NOT NULL,
    "totalAmount" double precision DEFAULT 0 NOT NULL,
    notes text,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: login_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "ipAddress" text NOT NULL,
    "userAgent" text NOT NULL,
    browser text,
    device text,
    city text,
    "loggedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: maintenance_bills; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenance_bills (
    id text NOT NULL,
    "flatId" text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    amount double precision NOT NULL,
    status public."BillStatus" DEFAULT 'unpaid'::public."BillStatus" NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    priority public."NoticePriority" DEFAULT 'normal'::public."NoticePriority" NOT NULL,
    "postedBy" text,
    "postedOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresOn" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    "flatId" text,
    message text NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: onboarding_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_sessions (
    id text NOT NULL,
    "societyId" integer NOT NULL,
    "currentStep" integer DEFAULT 1 NOT NULL,
    "step1Data" jsonb,
    "step2Data" jsonb,
    "step3Data" jsonb,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: parking_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parking_slots (
    id text NOT NULL,
    "slotNumber" text NOT NULL,
    "flatId" text,
    "vehicleNumber" text,
    "vehicleType" text,
    "isOccupied" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "billId" text NOT NULL,
    "amountPaid" double precision NOT NULL,
    "paidOn" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "paymentMode" public."PaymentMode" NOT NULL,
    notes text,
    "recordedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: residents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.residents (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text NOT NULL,
    whatsapp text,
    "flatId" text NOT NULL,
    "residentType" public."ResidentType" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "moveInDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "moveOutDate" timestamp(3) without time zone,
    "numCars" integer DEFAULT 0 NOT NULL,
    "numBikes" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    "idProofType" text,
    "idProofNumber" text,
    "emergencyContactName" text,
    "emergencyContactPhone" text
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "societyId" integer NOT NULL,
    role text NOT NULL,
    module public."PermissionModule" NOT NULL,
    "canView" boolean DEFAULT false NOT NULL,
    "canCreate" boolean DEFAULT false NOT NULL,
    "canEdit" boolean DEFAULT false NOT NULL,
    "canDelete" boolean DEFAULT false NOT NULL,
    "canExport" boolean DEFAULT false NOT NULL,
    "updatedBy" text,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: societies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.societies (
    id integer NOT NULL,
    name text NOT NULL,
    address text,
    "registrationNumber" text,
    "contactEmail" text,
    "contactPhone" text,
    city text,
    state text,
    pincode text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    status public."SocietyStatus" DEFAULT 'active'::public."SocietyStatus" NOT NULL,
    "setupToken" text,
    "setupTokenExpiry" timestamp(3) without time zone,
    "logoUrl" text,
    "activatedAt" timestamp(3) without time zone,
    "societyUrl" character varying(255),
    "accountNumber" character varying(20)
);


--
-- Name: societies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.societies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: societies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.societies_id_seq OWNED BY public.societies.id;


--
-- Name: society_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.society_settings (
    id text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    "varName" text NOT NULL,
    "varValue" text NOT NULL
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    phone text,
    shift text,
    "joinDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL
);


--
-- Name: totp_secrets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.totp_secrets (
    "userId" text NOT NULL,
    secret text NOT NULL,
    "isEnabled" boolean DEFAULT false NOT NULL,
    "backupCodes" text[]
);


--
-- Name: user_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notes (
    id text NOT NULL,
    "userId" text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    color text DEFAULT 'yellow'::text NOT NULL,
    "isPinned" boolean DEFAULT false NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "residentId" text,
    "staffId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "societyId" integer NOT NULL
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id text NOT NULL,
    "residentId" text NOT NULL,
    "flatId" text NOT NULL,
    "vehicleType" public."VehicleType" NOT NULL,
    "vehicleNumber" text NOT NULL,
    make text,
    model text,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "societyId" integer DEFAULT 1 NOT NULL,
    name text NOT NULL,
    "contactPerson" text,
    phone text,
    email text,
    "serviceType" text NOT NULL,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: visitors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.visitors (
    id text NOT NULL,
    "flatId" text NOT NULL,
    "visitorName" text NOT NULL,
    phone text,
    "vehicleNumber" text,
    purpose text,
    "entryTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "exitTime" timestamp(3) without time zone,
    "loggedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "visitorType" public."VisitorType" DEFAULT 'other'::public."VisitorType" NOT NULL
);


--
-- Name: expense_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories ALTER COLUMN id SET DEFAULT nextval('public.expense_categories_id_seq'::regclass);


--
-- Name: societies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies ALTER COLUMN id SET DEFAULT nextval('public.societies_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a77c4d50-affd-4294-9cc0-e7072a575dec	ae810c348040d69d8fc89c18dace46b15fc2a800e5547afaa890ef52e81afff2	2026-05-15 06:13:36.582498+00	20260515061336_initial_setup	\N	\N	2026-05-15 06:13:36.392767+00	1
f883c553-2622-461a-b5a6-d23dee22bb69	e021b0335d3a19f5b75220415d3e9a8c3d62c47823411eefc2f7494d498a281a	2026-05-15 06:44:08.98671+00	20260515064408_eav_society_settings	\N	\N	2026-05-15 06:44:08.952561+00	1
1073e4ac-2ccf-4719-acbc-a668cd426390	ba4f391a93e09a21874ffe765abd768b8967d8a4995e912b3eb1a6b435189046	2026-06-22 12:59:16.731657+00	20260622_sprint5_acl	\N	\N	2026-06-22 12:59:16.614907+00	1
12d0f43b-c109-4dfc-a542-a58b1cdd4ad5	f672845e9fbd57e597686bc2346aa9d5b449c625894034f58748f568cbacbe13	2026-05-15 06:51:47.439375+00	20260515065147_add_societies_master_table	\N	\N	2026-05-15 06:51:47.398825+00	1
c48e6d34-c892-47dc-bc83-92dc80f0936a	a28d21bbc274167fe81d08880bbf3a789723839f48adb5ce331bba2fe073e1cd	2026-05-15 07:05:31.464294+00	20260515070531_add_society_id_multi_tenancy	\N	\N	2026-05-15 07:05:31.436328+00	1
db7b4dca-224d-451f-b9d3-ee92f6886202	598680fafee4b1f4666c70e5c73023c05178242f22d4933f092a99bca922ddd8	2026-06-08 10:34:45.372092+00	20260608103445_add_expenses_table	\N	\N	2026-06-08 10:34:45.337694+00	1
b5219f5a-c7bd-4944-a9e0-5b17750e5fd1	6994c971f70e3575a1d1429caaf975042c98fb36fb1589d21b843e7665e0aa5f	2026-06-27 08:45:00.05097+00	20260627_resident_email_optional	\N	\N	2026-06-27 08:45:00.013626+00	1
d21e6e54-3bba-4190-a091-0cb91e4eb3e3	5f56660d6022f7ba37c2956a21f2abbf846130d0526ba0313f790079e781badf	2026-06-08 14:38:34.053956+00	20260608143700_add_expense_categories_table	\N	\N	2026-06-08 14:38:34.022851+00	1
37c22fa9-11ab-40ad-baf4-a457d474d5ce	945643796965cdfaab79b52cabfdfbaa07769d60b97745db7f44c17f466d5880	2026-06-08 14:38:35.239176+00	20260608143835_add_expense_categories_table	\N	\N	2026-06-08 14:38:35.218629+00	1
c6527e5b-8ebf-4e59-b698-915b89944b22	365d185ffeab4ade468bd9fe107287832a0daa26f9dad6099e6f03c695a3ceb0	2026-06-09 16:42:04.099944+00	20260609164204_add_income_invoices	\N	\N	2026-06-09 16:42:04.040946+00	1
ec5da9f3-af0c-4a3e-abdc-435821ae3526	de1d7e1eb384be5dbaa40ac392b7aab638f8f65ac9071538e1b8539d780af134	2026-07-03 16:12:53.296481+00	20260703_resident_profile	\N	\N	2026-07-03 16:12:53.229713+00	1
4c476391-cc3e-4b21-b942-5c8fecd5979d	f450a781aa1a79478a722fbb156d1c20416f20cde244ff2d24b7e2c90b38d05d	2026-06-10 05:06:01.763669+00	20260610050601_add_events_vendors_notes	\N	\N	2026-06-10 05:06:01.646+00	1
db30fbb0-75b7-4293-8159-c26d84b2e7fd	1c8a00998c3bba2eb30e263cc47b9fa886a933da11c1dac83e1552f49816e593	2026-06-10 14:09:11.81729+00	20260610_add_blocks_expand_flat_type		\N	2026-06-10 14:09:11.81729+00	0
71f38b9a-d2d2-42bf-8b02-993a0b81d967	a8213a7eea920b563e0ab34cd355ed096020e0eebbfe6f0b2d26baa1e113e9c0	2026-06-13 07:41:27.878998+00	20260613_add_helpers	\N	\N	2026-06-13 07:41:27.806432+00	1
9586234e-551c-4010-a885-099828ea03ab	d356499f53de039e6a3d1adbc12d0cce7f84edb00c615f60f0150ea84e303391	2026-06-13 07:41:27.899799+00	20260613_add_visitor_type	\N	\N	2026-06-13 07:41:27.885575+00	1
5718209a-fc90-43b9-bfc2-2aba3a4103dd	b818d41fe2be61e296f6f761c219a120e9a46fa0b1ac05f533a3556f58dbc8c0	2026-07-03 16:12:53.314365+00	20260703_resident_profile_fields	\N	\N	2026-07-03 16:12:53.304576+00	1
6151c52f-f23c-4195-a74d-efc19d62682e	2d5c47d626f3245c2a22bd40f3dfb661ed815cdff53c55fd3518e62c3492e577	2026-06-13 10:18:49.869352+00	20260613_sprint2_auth_overhaul	\N	\N	2026-06-13 10:18:49.805908+00	1
9e6c3a65-b773-4671-bd63-0282e0d66607	c829a3aeda9c4a740ab36f22e5cbbf610baad0c3d9c987391753c073db542ef4	2026-06-15 14:07:05.384973+00	20260616_onboarding	\N	\N	2026-06-15 14:07:05.301639+00	1
0da8ee59-2bc3-48bd-9d2d-0ac67179d9cf	ccfc72ab73e00c258a0991c30432875220e2c396c27627cb3a0de118ed2de2cc	2026-07-10 12:00:36.451969+00	20260710_society_account_login	\N	\N	2026-07-10 12:00:36.390318+00	1
0158127f-6bf6-431b-926d-11bee5d64a99	e226ff0b5593b4cdd58d466c19798c1fdc016e13149661cf99ee39e98ee7ad9b	2026-07-10 15:03:02.848753+00	20260710_society_email_unique	\N	\N	2026-07-10 15:03:02.837608+00	1
\.


--
-- Data for Name: amc_contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.amc_contracts (id, "societyId", "vendorId", "assetId", "contractNumber", "serviceType", "annualCost", "startDate", "endDate", "serviceFrequencyDays", "lastServiceDate", "nextServiceDue", status, notes, "createdAt", "updatedAt") FROM stdin;
1e617471-596b-4a57-9d09-71de22084397	1	d4d19a77-2890-452c-a550-030073771f8f	\N		Lift Maintenance	12000	2026-06-11 00:00:00	2027-06-11 00:00:00	90	\N	2026-09-09 00:00:00	active		2026-06-10 08:46:28.538	2026-06-10 08:46:28.538
\.


--
-- Data for Name: amc_service_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.amc_service_logs (id, "contractId", "serviceDate", "technicianName", "workDone", "serviceCost", "nextServiceDue", remarks, "recordedBy", "createdAt") FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, name, type, status, location, "lastServiceDate", "nextServiceDue", notes, "createdAt", "updatedAt", "societyId") FROM stdin;
5e218ee9-b06e-46f0-a5d6-89762c15eb43	Lift A	lift	operational	Block A - Main Entrance	\N	\N	\N	2026-05-15 07:23:37.8	2026-05-15 07:23:37.8	1
50d4d48a-5061-4007-b674-4acac4805899	Lift B	lift	operational	Block B - Main Entrance	\N	\N	\N	2026-05-15 07:23:37.8	2026-05-15 07:23:37.8	1
f83cae1b-ec60-458f-b4bd-3c783228d3ea	Borewell	borewell	operational	Ground Floor - Rear	\N	\N	\N	2026-05-15 07:23:37.8	2026-05-15 07:23:37.8	1
f59cc9ab-68a9-4929-8eb9-37928ef48fc4	Water Tank	water_tank	operational	Terrace Level	\N	\N	\N	2026-05-15 07:23:37.8	2026-05-15 07:23:37.8	1
\.


--
-- Data for Name: blacklisted_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blacklisted_tokens (id, token, "expiresAt", "createdAt") FROM stdin;
62fdb1b3-c10e-4752-860d-8e6838f84c84	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODIzNjg1MzIsImV4cCI6MTc4MjQ1NDkzMn0.VU_xWei7erKmNuuhfZ_dtfGbwyWrMsjyeQlQzyPnSdI	2026-06-26 06:22:12	2026-06-25 06:57:06.988
fca74842-708b-472b-8b2a-10cf0a2cb949	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI1NDMyMTQsImV4cCI6MTc4MjYyOTYxNH0.ldBuRszI9HrZOThqPAoBdVqp4g_TZXH38HovrM_1E2Q	2026-06-28 06:53:34	2026-06-27 09:51:49.617
d15c900c-df03-48da-b5e6-69f6bc8b7cb0	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI4OTY5MTcsImV4cCI6MTc4Mjk4MzMxN30.ilv4ZaVfJjxxETUXGDkcBu3lTaxYEAEhab8ISknoySg	2026-07-02 09:08:37	2026-07-01 15:56:52.885
e74a6dd2-b833-4fe4-8854-76a7c8d5f6c3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOWFmNDBjZi02MGMzLTQ1MzEtOGExYi0xYWVkYzY2YmRhNWEiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoib3duZXIiLCJyZXNpZGVudElkIjoiM2NkZmRiNWItZDgzNi00NDJlLTg2MTctYmZmY2I0NmJjMDAwIiwic3RhZmZJZCI6bnVsbCwiaWF0IjoxNzgyOTIxNDE5LCJleHAiOjE3ODMwMDc4MTl9.DOeJsuQZGe7LA7dQoKhoR-zZZe488hhp2VPtVqlcydg	2026-07-02 15:56:59	2026-07-01 16:06:33.25
a2ccb704-fe75-4c63-9d14-4a93f60b2d22	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI5MjIxMzMsImV4cCI6MTc4MzAwODUzM30.zxD84yJ3N9B-RzLM4fUL1OnC8jAh2GLpF1HJf7_o1ag	2026-07-02 16:08:53	2026-07-01 16:33:14.911
7a45fd5b-e54d-4584-bd58-32db2f613d30	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI5Nzg0NDMsImV4cCI6MTc4MzA2NDg0M30.bnkGJopbUX6mbQijdWsZ8HHe5kE7IbR-H6sTCAeGJEA	2026-07-03 07:47:23	2026-07-02 10:03:37.746
a0ddeb80-a156-4e86-8573-74dd5b9347e6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTUyOWJiOC0yMTM3LTQ3Y2YtODhkNC00NTVhNTc0NDVhNjgiLCJzb2NpZXR5SWQiOjEyLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI5ODY3NDMsImV4cCI6MTc4MzA3MzE0M30.syyoJEWDUNWcP8Auv2543hniUksOEym8vJHRQzff80Y	2026-07-03 10:05:43	2026-07-02 13:12:33.725
6c947d59-0ab8-4aea-b5b6-3a92036ba826	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTgyMjU2YS1kYzQ1LTRhZDktYmY1Yi0yMzcwMjUxMDFlYzgiLCJzb2NpZXR5SWQiOjEsInJvbGUiOiJhZG1pbiIsInJlc2lkZW50SWQiOm51bGwsInN0YWZmSWQiOm51bGwsImlhdCI6MTc4Mjk5Nzk1OCwiZXhwIjoxNzgzMDg0MzU4fQ.c9S5Wf20yugqtHDe4BAdfLn2bEuRIvf6Dh01g9FgvQQ	2026-07-03 13:12:38	2026-07-02 13:21:24.957
bc83c36b-8adf-441b-b8e3-d0eb98ae96cf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTUyOWJiOC0yMTM3LTQ3Y2YtODhkNC00NTVhNTc0NDVhNjgiLCJzb2NpZXR5SWQiOjEyLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODI5OTg0OTIsImV4cCI6MTc4MzA4NDg5Mn0.QLAGHMrS9KAr3VVhzSujM1oflanmy_gxpt0nkxuZwks	2026-07-03 13:21:32	2026-07-02 14:35:22.915
712366bd-5522-4d99-ab2c-668e275c4b6f	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTM1ZTcwNy0zY2QyLTQ2MzktODJhMS01MjA5MGNkZTQ2MzgiLCJzb2NpZXR5SWQiOjEzLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODMwMDMwMDQsImV4cCI6MTc4MzA4OTQwNH0.sRggqxu2GVm3askBDbASXNP4kabbIQZwJnuqSHuaSuk	2026-07-03 14:36:44	2026-07-02 16:30:56.805
d393ae88-b1ea-45e0-ab30-ababf0adaf01	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTUyOWJiOC0yMTM3LTQ3Y2YtODhkNC00NTVhNTc0NDVhNjgiLCJzb2NpZXR5SWQiOjEyLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODMwODI1MDMsImV4cCI6MTc4MzE2ODkwM30.xJytZf31NIIlLqXSgw5cvG9jyMQrhtsgnobHMwi3vGg	2026-07-04 12:41:43	2026-07-03 14:38:19.827
ae7fafa3-26bd-4c63-9a2d-9f5cbed88372	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyZTM1ZTcwNy0zY2QyLTQ2MzktODJhMS01MjA5MGNkZTQ2MzgiLCJzb2NpZXR5SWQiOjEzLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODMwODk1MDgsImV4cCI6MTc4MzE3NTkwOH0.pzntDYcl29k8j0tfm0d564kkBjT1CFqAfVRmgVoOz4c	2026-07-04 14:38:28	2026-07-03 16:15:04.648
4bb59e7a-fddb-4912-8e62-528b7892208c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDQyM2JmOC1mNGE5LTQwMTYtOTVjYS02ZWJmOGYzZGZjOTIiLCJzb2NpZXR5SWQiOjE0LCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM2ODYxMjQsImV4cCI6MTc4Mzc3MjUyNH0.Ev0vx6tnJtfCcehZsChCBwXRGmk_TaKFDOxLMEQaV7o	2026-07-11 12:22:04	2026-07-10 12:26:23.375
d3231112-b00d-4582-ba9d-4a7f7763c95a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDQyM2JmOC1mNGE5LTQwMTYtOTVjYS02ZWJmOGYzZGZjOTIiLCJzb2NpZXR5SWQiOjE0LCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM2OTQ1NjcsImV4cCI6MTc4Mzc4MDk2N30.4hsu2sydvjR1wbVqgJ2W_cnd1dMOgzAXF4y4eFBXdmw	2026-07-11 14:42:47	2026-07-10 14:44:52.55
58cd08a3-6c8a-4382-93c6-6ff9579ef962	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM2OTQ3MTgsImV4cCI6MTc4Mzc4MTExOH0.JPQJ0pO_9nXHhvBFpDU1HV0yQ_UAaHt9DVvPOXS_qPw	2026-07-11 14:45:18	2026-07-10 14:54:07.591
d4afbd50-5534-454f-b4d6-f423a5bd17d7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM2OTc3NjgsImV4cCI6MTc4Mzc4NDE2OH0.dm4jOsXnP_RqZwy1fAs4ki11vUFuw33-zWDppnn9_pE	2026-07-11 15:36:08	2026-07-10 15:37:18.886
d2ea93c6-50b7-4c1b-9a93-bd892a2418f1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM2OTc4NTAsImV4cCI6MTc4Mzc4NDI1MH0.001ERLVDK7ptfxMNkvdDFc0xeddCe_ySCr2PLjCmXG0	2026-07-11 15:37:30	2026-07-10 15:44:15.285
2954b86d-c4bd-47e8-b676-b84b09b8dfa9	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZGJkY2I4Zi1kNmM1LTQ1MmMtOGQ4Mi1kYWI3YTNlNjY2NDYiLCJzb2NpZXR5SWQiOjEwLCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM3NDY2NzAsImV4cCI6MTc4MzgzMzA3MH0.mi_HjiuEUdoYiLFdNVIcb-pM4MpA7_7mW0jiy_QIwj4	2026-07-12 05:11:10	2026-07-11 05:12:03.51
709632b6-cfef-4be3-be97-1bfa81bbd5fc	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDQyM2JmOC1mNGE5LTQwMTYtOTVjYS02ZWJmOGYzZGZjOTIiLCJzb2NpZXR5SWQiOjE0LCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM3NTkwNzEsImV4cCI6MTc4Mzg0NTQ3MX0.6PWBGgdMqj_bug5vFzyxHyMwJ3FQNG6upZKV6T0mcWk	2026-07-12 08:37:51	2026-07-11 09:15:58.12
dac9007e-4892-46ba-9cb6-96e0a68ee060	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYWRjMjM5Ny02YmM0LTQ1ZTMtYmZmNy0xNDEyNjZmMjUxMDAiLCJzb2NpZXR5SWQiOjE1LCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODM3NjE0MzcsImV4cCI6MTc4Mzg0NzgzN30.p7mGjpoFxdQ2KSMmczXigXw6oS-csrCxKSSkchhHrtY	2026-07-12 09:17:17	2026-07-11 09:19:01.205
d2be9d59-95d6-4884-8c31-dded1ac5f7ca	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmNDQyM2JmOC1mNGE5LTQwMTYtOTVjYS02ZWJmOGYzZGZjOTIiLCJzb2NpZXR5SWQiOjE0LCJyb2xlIjoiYWRtaW4iLCJyZXNpZGVudElkIjpudWxsLCJzdGFmZklkIjpudWxsLCJpYXQiOjE3ODkyMjk0MzIsImV4cCI6MTc4OTMxNTgzMn0.4rm7QCkiqTs2Mdb7MaQGrCg_zlfO7Uacf3h9h2c4bPE	2026-09-13 16:10:32	2026-09-12 17:00:59.257
\.


--
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blocks (id, "societyId", name, description, "blockType", "totalFloors", "isActive", "createdAt", "updatedAt") FROM stdin;
dfbee596-594b-4f91-94eb-2f0b68d569dd	1	Block A	Main residential block	flats	5	t	2026-06-10 14:48:45.386	2026-06-10 14:48:45.386
3e1bd21e-9565-48c9-93b9-9f096b94757d	1	Block B	HIG	rowhouses	\N	t	2026-06-11 05:27:24.184	2026-06-11 05:27:24.184
bb5a6f75-f355-4484-85dd-a6dc55c3418e	1	Main Block	\N	flats	\N	t	2026-06-11 12:27:38.061	2026-06-11 12:27:38.061
310eb5b6-6840-4a37-a1e4-ea30852fa9b3	1	Wing A	\N	flats	\N	t	2026-06-15 15:55:43.04	2026-06-15 15:55:43.04
493e95f6-1228-4b0f-ad6f-d90eaafbd677	1	Wing B	\N	flats	\N	t	2026-06-15 15:56:02.638	2026-06-15 15:56:02.638
d961bc64-15ad-48b0-8567-1f03f6f6ba30	4	Wing B	wing b	flats	5	t	2026-06-16 04:31:52.204	2026-06-16 04:31:52.204
b19d2d55-29d9-4220-b9c2-1d861039730b	4	Wing A	wing a	flats	4	t	2026-06-15 16:02:52.99	2026-06-16 04:32:05.808
c366192c-a763-4a50-9b5e-0840c32e40af	8	Street 1	\N	flats	\N	t	2026-06-16 12:01:58.577	2026-06-16 12:01:58.577
900660a1-0875-4a0e-95c9-5e552b982dd2	10	Alpha A	\N	flats	\N	t	2026-06-16 14:51:30.342	2026-06-16 14:51:30.342
96703a6c-5688-411e-9759-b08cb4e25343	10	Wing B	\N	flats	\N	t	2026-06-16 14:52:02.629	2026-06-16 14:52:02.629
eb0a2a14-9dfc-4dd0-b0cd-a3d8ab81fb84	10	Wing C	\N	flats	\N	t	2026-06-16 14:55:04.588	2026-06-16 14:55:04.588
2e22c027-afc1-44a5-927f-75d91eb354ac	12	A	\N	flats	\N	t	2026-07-02 10:06:15.943	2026-07-02 10:06:15.943
ec759036-e07d-47ad-b484-ced13628c5fd	12	B	\N	flats	\N	t	2026-07-02 10:06:19.922	2026-07-02 10:06:19.922
8cbf9fd1-e3a8-4784-99f7-69b5d12d41aa	12	C	\N	flats	\N	t	2026-07-02 10:06:23.234	2026-07-02 10:06:23.234
296c228c-0068-4aa0-85ea-e6afd6b228fd	12	D	\N	flats	\N	t	2026-07-02 10:06:25.765	2026-07-02 10:06:25.765
d7c45dc5-e479-4f81-b1e6-270632c3fec3	13	Main	\N	flats	\N	t	2026-07-02 14:37:30.09	2026-07-02 14:37:30.09
ac13a266-514e-4924-ac2a-04dae2e86de3	14	Main Block	\N	flats	\N	t	2026-07-10 12:22:23.262	2026-07-10 12:22:23.262
85f43a77-1926-4d3d-89f2-154ccd4a184f	15	Tower A	Main tower	flats	\N	t	2026-07-11 09:17:48.083	2026-07-11 09:17:48.083
c58bf051-bff4-4a34-af51-e9d069aea2cb	15	Tower B	\N	flats	\N	t	2026-07-11 09:17:56.415	2026-07-11 09:17:56.415
5c567ec5-eaf5-4039-a835-e0956e3cb49f	15	Tower C	\N	flats	\N	t	2026-07-11 09:18:01.616	2026-07-11 09:18:01.616
a56be515-32db-4617-a755-02958e700b36	15	Tower D	\N	flats	\N	t	2026-07-11 09:18:06.612	2026-07-11 09:18:06.612
\.


--
-- Data for Name: committee_achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.committee_achievements (id, "committeeId", title, description, "achievedOn", category, "createdAt", "updatedAt") FROM stdin;
a545b63a-7b6b-4e65-9e19-e3a806d226e9	736afcfb-463b-4644-8ae8-69d76e71012f	Garden Renovation	Renovated Garden, Pavers, Chairs and Jhula.	2026-06-22 00:00:00	other	2026-06-22 17:24:48.451	2026-06-22 17:24:48.451
954906a1-6660-4877-9052-3e8126015690	736afcfb-463b-4644-8ae8-69d76e71012f	Lift Improvements	Lift Panel and others	2026-06-01 00:00:00	infrastructure	2026-06-22 17:25:30.202	2026-06-22 17:25:30.202
55636834-9044-43a8-8249-b2ed5c8f64e8	736afcfb-463b-4644-8ae8-69d76e71012f	Society Registration	\N	2025-09-01 00:00:00	legal	2026-06-22 17:26:11.691	2026-06-22 17:26:11.691
007f74ac-e313-4915-ad72-2ae15679ff21	736afcfb-463b-4644-8ae8-69d76e71012f	Society Office	\N	2025-12-01 00:00:00	infrastructure	2026-06-22 17:26:40.198	2026-06-22 17:26:40.198
\.


--
-- Data for Name: committee_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.committee_members (id, "committeeId", "residentId", designation, "isActive", "joinedOn", "leftOn", notes, "createdAt", "updatedAt") FROM stdin;
9c80ad82-6978-4e63-8a42-b9817581b580	736afcfb-463b-4644-8ae8-69d76e71012f	3cdfdb5b-d836-442e-8617-bffcb46bc000	joint_secretary	t	2026-06-27 00:00:00	\N	\N	2026-06-27 09:50:23.918	2026-06-27 09:50:23.918
14f59048-3758-4969-a3da-41f19827c917	36b1bcc9-3043-4b36-bcba-00f74ca12e07	c6bd2a61-69cd-4ca6-ac66-8ae9ef43a0da	president	t	2026-07-02 00:00:00	\N	\N	2026-07-02 14:45:40.963	2026-07-02 14:45:40.963
\.


--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.committees (id, "societyId", name, "formedOn", "dissolvedOn", "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
cb7aa074-4766-498b-a24d-da3fa56aa384	1	GR Committee 2025-26	2025-06-01 00:00:00	\N	t	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-15 07:15:48.36	2026-06-15 07:16:06.271
736afcfb-463b-4644-8ae8-69d76e71012f	10	Managing Committee 2026-2027	2026-06-22 00:00:00	\N	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 17:23:28.909	2026-06-27 09:50:57.284
7d623dbc-acd1-4bf8-81ec-9ffda534159c	10	2026-27	2026-06-27 00:00:00	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 09:50:48.832	2026-06-27 09:50:57.284
36b1bcc9-3043-4b36-bcba-00f74ca12e07	13	Management 2026-27	2026-07-02 00:00:00	\N	t	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-02 14:45:24.45	2026-07-02 14:45:28.887
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaints (id, "flatId", "raisedBy", category, description, status, "adminRemark", "raisedOn", "resolvedOn", "createdAt", "updatedAt") FROM stdin;
7210bf56-c4e9-43a5-b913-d16f2251155f	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	62678121-1626-4637-89c3-54153e164523	maintenance	Water leakage in bathroom ceiling	in_progress	Team dispatched, will fix by tomorrow	2026-06-05 08:28:34.773	\N	2026-06-05 08:28:34.773	2026-06-05 08:28:34.859
\.


--
-- Data for Name: event_contributions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_contributions (id, "eventId", "contributorName", "flatId", amount, "paymentMode", "paidOn", notes, "recordedBy", "createdAt", "updatedAt") FROM stdin;
24f50ff1-96b0-4f23-8d5a-11183cc44ec5	8ad49e38-701b-426f-8bc8-5ca09e9fa611	dilip	\N	1000	cash	2026-06-10 00:00:00		4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 11:37:49.186	2026-06-10 11:37:49.186
97832814-7502-4c18-b872-699939884134	031ca2ac-c1db-473d-9cb7-ebb1e9bf1a8a	Abc	\N	5000	cash	2026-06-03 00:00:00		1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:23:02.283	2026-06-18 06:23:02.283
5346ceb2-f152-401f-a6b0-ef456882e610	031ca2ac-c1db-473d-9cb7-ebb1e9bf1a8a	alpha man	\N	5000	upi	2026-06-18 00:00:00		1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:23:34.074	2026-06-18 06:23:34.074
eb86cc67-7d7f-49e4-ae88-ce8e2f5dfedc	cf1c474e-4651-43ec-9b81-5513d8f3d9da	ABC	\N	1000	cash	2026-07-02 00:00:00		2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-02 14:43:54.303	2026-07-02 14:43:54.303
00eaa80e-a703-421d-9dd4-2cd704e2fee9	52f0a682-025a-4611-b598-1c9c03751ef5	Dilip	\N	1000	cash	2026-09-12 00:00:00		f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	2026-09-12 16:16:40.195	2026-09-12 16:16:40.195
8c316f1b-eeee-4cff-b2b3-7fb01affce90	52f0a682-025a-4611-b598-1c9c03751ef5	Test	\N	500	cash	2026-09-12 17:00:46.584	\N	f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	2026-09-12 17:00:46.585	2026-09-12 17:00:46.585
\.


--
-- Data for Name: event_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_expenses (id, "eventId", title, category, amount, "paidOn", vendor, notes, "recordedBy", "createdAt", "updatedAt") FROM stdin;
f0530ff6-40d5-4892-a92b-40c7b2f2e23b	8ad49e38-701b-426f-8bc8-5ca09e9fa611	food	food	600	2026-06-10 00:00:00		\N	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 11:39:32.179	2026-06-10 11:39:32.179
f3fb4b35-c3f9-4d50-983b-747686f6b4ad	cf1c474e-4651-43ec-9b81-5513d8f3d9da	Murti	other	11000	2026-07-02 00:00:00		\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-02 14:44:14.295	2026-07-02 14:44:14.295
\.


--
-- Data for Name: event_team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_team_members (id, "eventId", "residentId", role, notes, "createdAt") FROM stdin;
42748b69-3f60-4569-981d-8b699553e156	8ad49e38-701b-426f-8bc8-5ca09e9fa611	244152f9-4cad-4ffe-bb78-7034547a12f5	Organizer	\N	2026-06-10 11:38:13.363
1120cc24-2623-4245-906f-f1ce74143439	cf1c474e-4651-43ec-9b81-5513d8f3d9da	c6bd2a61-69cd-4ca6-ac66-8ae9ef43a0da	Organizer	\N	2026-07-02 14:44:30.549
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, "societyId", name, description, "eventDate", status, "budgetTarget", "createdBy", "createdAt", "updatedAt") FROM stdin;
b6429b2c-918d-41fb-b44a-94b8ebace875	1	Dusshera		2026-09-30 00:00:00	planning	0	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 09:14:08.9	2026-06-10 09:14:08.9
66ecc663-8983-47f1-84e0-d7c87600e47d	1	Diwali		2026-10-30 00:00:00	planning	0	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 09:14:25.249	2026-06-10 09:14:25.249
8ad49e38-701b-426f-8bc8-5ca09e9fa611	1	Ganesh Chaturthi		2026-06-27 00:00:00	completed	0	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 09:12:40.228	2026-06-10 11:38:33.826
031ca2ac-c1db-473d-9cb7-ebb1e9bf1a8a	10	Advance Payment	2026	2026-06-01 00:00:00	active	250000	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:22:32.031	2026-06-18 06:22:32.031
cf1c474e-4651-43ec-9b81-5513d8f3d9da	13	Ganesh Chaturthi		2026-07-31 00:00:00	planning	25000	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-02 14:43:29.489	2026-07-02 14:43:29.489
52f0a682-025a-4611-b598-1c9c03751ef5	14	Ganesh Chaturthi 2026		2026-09-14 00:00:00	active	25000	f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	2026-09-12 16:15:59.182	2026-09-12 16:15:59.182
\.


--
-- Data for Name: expense_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_categories (id, "societyId", name, slug, color, "isDefault", "sortOrder", "isActive", "createdAt", "updatedAt") FROM stdin;
1	1	Maintenance	maintenance	#8884d8	t	1	t	2026-06-08 14:42:33.188	2026-06-08 14:42:33.188
2	1	Utility	utility	#82ca9d	t	2	t	2026-06-08 14:42:33.2	2026-06-08 14:42:33.2
3	1	Salary	salary	#ffc658	t	3	t	2026-06-08 14:42:33.205	2026-06-08 14:42:33.205
4	1	Repair	repair	#ff7300	t	4	t	2026-06-08 14:42:33.209	2026-06-08 14:42:33.209
5	1	Admin	admin	#0088fe	t	5	t	2026-06-08 14:42:33.214	2026-06-08 14:42:33.214
6	1	Other	other	#a4a4a4	t	6	t	2026-06-08 14:42:33.22	2026-06-08 14:42:33.22
7	2	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
8	2	Utility	utility	#82ca9d	t	2	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
9	2	Salary	salary	#ffc658	t	3	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
10	2	Repair	repair	#ff7300	t	4	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
11	2	Admin	admin	#0088fe	t	5	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
12	2	Other	other	#a4a4a4	t	6	t	2026-06-15 14:24:57.127	2026-06-15 14:24:57.127
13	3	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
14	3	Utility	utility	#82ca9d	t	2	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
15	3	Salary	salary	#ffc658	t	3	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
16	3	Repair	repair	#ff7300	t	4	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
17	3	Admin	admin	#0088fe	t	5	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
18	3	Other	other	#a4a4a4	t	6	t	2026-06-15 14:25:05.785	2026-06-15 14:25:05.785
19	4	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
20	4	Utility	utility	#82ca9d	t	2	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
21	4	Salary	salary	#ffc658	t	3	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
22	4	Repair	repair	#ff7300	t	4	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
23	4	Admin	admin	#0088fe	t	5	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
24	4	Other	other	#a4a4a4	t	6	t	2026-06-15 14:41:09.952	2026-06-15 14:41:09.952
25	5	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
26	5	Utility	utility	#82ca9d	t	2	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
27	5	Salary	salary	#ffc658	t	3	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
28	5	Repair	repair	#ff7300	t	4	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
29	5	Admin	admin	#0088fe	t	5	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
30	5	Other	other	#a4a4a4	t	6	t	2026-06-15 15:05:29.621	2026-06-15 15:05:29.621
31	6	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
32	6	Utility	utility	#82ca9d	t	2	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
33	6	Salary	salary	#ffc658	t	3	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
34	6	Repair	repair	#ff7300	t	4	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
35	6	Admin	admin	#0088fe	t	5	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
36	6	Other	other	#a4a4a4	t	6	t	2026-06-15 15:06:33.432	2026-06-15 15:06:33.432
37	7	Maintenance	maintenance	#8884d8	t	1	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
38	7	Utility	utility	#82ca9d	t	2	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
39	7	Salary	salary	#ffc658	t	3	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
40	7	Repair	repair	#ff7300	t	4	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
41	7	Admin	admin	#0088fe	t	5	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
42	7	Other	other	#a4a4a4	t	6	t	2026-06-15 15:08:19.506	2026-06-15 15:08:19.506
43	8	Maintenance	maintenance	#8884d8	t	1	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
44	8	Utility	utility	#82ca9d	t	2	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
45	8	Salary	salary	#ffc658	t	3	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
46	8	Repair	repair	#ff7300	t	4	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
47	8	Admin	admin	#0088fe	t	5	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
48	8	Other	other	#a4a4a4	t	6	t	2026-06-16 11:59:42.437	2026-06-16 11:59:42.437
49	9	Maintenance	maintenance	#8884d8	t	1	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
50	9	Utility	utility	#82ca9d	t	2	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
51	9	Salary	salary	#ffc658	t	3	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
52	9	Repair	repair	#ff7300	t	4	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
53	9	Admin	admin	#0088fe	t	5	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
54	9	Other	other	#a4a4a4	t	6	t	2026-06-16 13:08:24.935	2026-06-16 13:08:24.935
55	10	Maintenance	maintenance	#8884d8	t	1	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
56	10	Utility	utility	#82ca9d	t	2	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
57	10	Salary	salary	#ffc658	t	3	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
58	10	Repair	repair	#ff7300	t	4	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
59	10	Admin	admin	#0088fe	t	5	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
60	10	Other	other	#a4a4a4	t	6	t	2026-06-16 14:50:16.18	2026-06-16 14:50:16.18
61	11	Maintenance	maintenance	#8884d8	t	1	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
62	11	Utility	utility	#82ca9d	t	2	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
63	11	Salary	salary	#ffc658	t	3	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
64	11	Repair	repair	#ff7300	t	4	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
65	11	Admin	admin	#0088fe	t	5	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
66	11	Other	other	#a4a4a4	t	6	t	2026-07-02 09:56:50.295	2026-07-02 09:56:50.295
67	12	Maintenance	maintenance	#8884d8	t	1	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
68	12	Utility	utility	#82ca9d	t	2	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
69	12	Salary	salary	#ffc658	t	3	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
70	12	Repair	repair	#ff7300	t	4	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
71	12	Admin	admin	#0088fe	t	5	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
72	12	Other	other	#a4a4a4	t	6	t	2026-07-02 10:04:20.556	2026-07-02 10:04:20.556
73	13	Maintenance	maintenance	#8884d8	t	1	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
74	13	Utility	utility	#82ca9d	t	2	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
75	13	Salary	salary	#ffc658	t	3	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
76	13	Repair	repair	#ff7300	t	4	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
77	13	Admin	admin	#0088fe	t	5	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
78	13	Other	other	#a4a4a4	t	6	t	2026-07-02 14:35:56.151	2026-07-02 14:35:56.151
79	14	Maintenance	maintenance	#8884d8	t	1	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
80	14	Utility	utility	#82ca9d	t	2	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
81	14	Salary	salary	#ffc658	t	3	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
82	14	Repair	repair	#ff7300	t	4	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
83	14	Admin	admin	#0088fe	t	5	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
84	14	Other	other	#a4a4a4	t	6	t	2026-07-10 12:21:19.707	2026-07-10 12:21:19.707
85	15	Maintenance	maintenance	#8884d8	t	1	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
86	15	Utility	utility	#82ca9d	t	2	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
87	15	Salary	salary	#ffc658	t	3	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
88	15	Repair	repair	#ff7300	t	4	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
89	15	Admin	admin	#0088fe	t	5	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
90	15	Other	other	#a4a4a4	t	6	t	2026-07-11 09:16:44.185	2026-07-11 09:16:44.185
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, "societyId", title, amount, "paidOn", vendor, notes, "recordedBy", "createdAt", "updatedAt", category) FROM stdin;
2acc7d05-6fe2-4f67-b0d8-8da2773d2b7a	1	Guard 1 Salary	10000	2026-06-08 00:00:00	Self		4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-08 11:13:44.829	2026-06-08 11:13:44.829	salary
787e6bf7-5f07-4e3d-b9c5-11115fa51517	1	Guard 2 salary	10000	2026-06-08 00:00:00	Self		4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-08 11:14:10.601	2026-06-08 11:14:10.601	salary
1a56658e-e3cb-46f2-83dd-788ac9e154bd	10	shades	20000	2026-06-01 00:00:00	\N	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 04:15:54.443	2026-06-17 04:15:54.443	repair
50e17726-a65b-4b0c-b541-c40238d23da1	10	Nothing	1000	2026-06-17 00:00:00	\N	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 04:15:54.451	2026-06-17 04:15:54.451	maintenance
\.


--
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.family_members (id, "residentId", name, relation, phone, "dateOfBirth", "isEmergency", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: flats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flats (id, "flatNumber", floor, type, "sqFt", status, "createdAt", "updatedAt", "societyId", "blockId") FROM stdin;
60e0bb79-bda6-4cde-b41e-044280ba57c8	PH-01	5	penthouse	2000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
144d5a44-9759-41b2-a225-e2c673316ba0	PH-02	5	penthouse	2000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
b1c6a1e3-2880-4edf-b45e-a5a4daceae5a	F1-12	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
d65d30b4-9f62-4930-bef4-f2b7b6e79fb2	F2-01	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
c89fffdb-518f-40d3-b679-48bb02af16ae	F2-02	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
abe35e6a-fcea-4aa9-8fdc-c844e20a7db9	F2-03	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
ab0a515d-8f88-43dc-aa95-6596b535c344	F2-04	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
3439c2fd-b671-4a93-bc56-f2becbdd26f9	F2-05	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
7a572cc8-3666-44ed-8774-3e90b6b7d64e	F2-06	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
9b5e73aa-1cf9-4a8e-a296-4c410e50fc82	F2-07	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
db5ee5e4-1d48-4f45-a7e7-42e7d351236f	F2-08	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
f06df8f8-c512-46be-b72d-7e9fd4084282	F2-09	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
5e15b1ab-ba40-46c3-b507-ab14d87fe96a	F2-10	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
6e49d205-1e35-429b-8bf2-52bc1ae8db79	F2-11	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
9834942f-c8cc-49ef-9236-5fd34348c67f	F2-12	2	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
85ba2980-77bb-428e-9f4b-9a0518cb3362	F3-01	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
d10501dd-e2ae-4c1a-bebb-5561b5d4d603	F3-02	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
f471d87e-8361-4f57-acf4-d2117dc2fc4d	F3-03	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
563bddba-8578-422f-a871-01363a0ad788	F3-04	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
dd8eca31-27a0-43f8-b016-b98e6b1b9797	F3-05	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
b3b922f5-d307-479d-a4f3-30fff5012784	F3-06	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
e2be3df0-67bc-43d3-973b-1d20ea0328bc	F3-07	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
9d192063-a483-44c6-9ec0-76da417749d9	F3-08	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
0cf79309-cd9d-4519-96f2-c9f66134ff07	F3-09	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
44c89582-2af8-45d9-aea2-fc3b1893e209	F3-10	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
128dc6f8-634c-463c-9242-0cc56af58ba7	F3-11	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
1a3c573d-8332-45d9-ad3c-b8d3d236963c	F3-12	3	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
f42db701-77e0-4dd0-9289-37deccacb3bb	F4-01	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
c74233c6-9d64-492e-ab3f-fe0728da449d	F4-02	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
28ef4c2d-0796-440d-8bdf-5f2543a3a857	F4-03	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
2deb13aa-7684-457f-9569-f55731acfe89	F4-04	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
2fc5dd53-3834-443b-afd2-f75c3fbb9db7	F4-05	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
87ef3547-131f-4dae-9a17-a4be3028f615	F4-06	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
b450dfb0-58ed-4d9b-9a88-f536855f236f	F4-07	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
767c9e14-c67d-434d-b463-ddbe3fb8cd50	F4-08	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
4c4d47da-393c-4b61-adbe-549a0b2ba2c6	F4-09	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
0122ae74-2a57-44c4-a834-22f2c62ddd64	F4-10	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
dd926d83-1bc5-46a4-b627-8ce71a1f614c	F4-11	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
d7610557-98d5-4fb2-b11b-dcc439489aa4	F4-12	4	flat	1000	vacant	2026-05-15 07:23:37.805	2026-05-15 07:23:37.805	1	\N
f456f9a3-7f73-4302-bf04-1bd4961de5df	F1-02	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:26:03.965	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
f24a6082-1a46-43af-98e0-60999ee51ec7	J-001	\N	bungalow	2400	vacant	2026-06-11 05:27:45.318	2026-06-11 05:27:45.318	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
95a93cab-c4a0-4a5e-898e-1e9d442a3e85	F1-01	1	flat	1000	occupied	2026-05-15 07:23:37.805	2026-06-11 05:35:23.376	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
84f83e8e-42cd-488f-8e20-a968f9ed2d0c	F1-03	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:35:27.451	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
b6dcc2f1-39ee-42aa-a1c0-c04dca75fdd5	F1-04	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:35:35.236	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
f9c21cb1-41a4-435b-8e9c-58f6a450c074	F1-05	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:35:40.234	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
72da3151-5703-429b-a6bf-e66e0381243a	F1-07	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:36:01.807	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
b4e09c54-3c28-42a9-8d31-e10f1288f0a6	F1-06	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:36:05.811	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
3f9f4e18-8189-4c7e-9e76-70c8b22117ce	F1-08	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:36:14.326	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
ba82b741-b66f-4961-ac4b-784eb6ec91fc	F1-09	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:36:18.57	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
96d05e41-e62d-47d4-a7ef-24f755c3facc	F1-10	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:55:34.383	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
5e2c2284-422d-4e74-bf3f-148c8bff85cd	F1-11	1	flat	1000	vacant	2026-05-15 07:23:37.805	2026-06-11 05:55:40.456	1	dfbee596-594b-4f91-94eb-2f0b68d569dd
c091c22c-16ad-4b77-a89d-d032859e723f	F-101	1	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
dfd03829-3fdd-4223-8a25-bcffe41658ec	F-102	1	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
6251e9a9-d3b1-4c54-91af-f89b67fd1f7d	F-103	1	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
f2449a98-87fa-4f5d-84f8-2b10d84568ce	F-104	1	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
6ac4b536-e75f-416e-920a-67e372f6a902	F-105	1	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
398a378d-1ba4-4771-9be1-1095f6ec6c65	F-106	1	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
7424534e-2f6f-4219-b1e8-f16ef9f71cb1	F-107	1	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
ea5cbe1a-1fa9-43a3-9782-04f0568bc5a9	F-108	1	flat	810	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
e7857c4e-cf25-4cc5-9c58-ca609548150b	F-109	1	flat	950	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
85085db5-36c7-4091-ab37-83414ed2f651	F-110	1	flat	675	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
43b00c10-2246-4c76-9d55-34d2e7bc7075	F-111	1	flat	1000	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
78a9d3a3-c20d-4ae9-9a54-29bef4cd9a07	F-112	1	flat	1143	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
0831932e-8826-449b-9640-5fa0a028102e	F-201	2	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
52df28cf-9756-47c2-af45-85e1544e6c41	F-202	2	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
76332af5-a724-42cc-b5b7-1bef1061808c	F-203	2	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
ec1d4936-d62b-47f5-93e2-b675c63280da	F-204	2	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
b772267f-3340-4082-979b-eb12862ce8b2	F-205	2	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
11632869-80b2-40c9-8e36-532371b4ab9a	F-206	2	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
0b1217f5-a1c6-416b-a980-ec8b4a3eb99d	F-207	2	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
964bb26a-33e5-4b8c-ab6a-45f224a52ffb	F-208	2	flat	810	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
f4edc2f7-1766-4d87-a3d1-fa6fb44a419d	F-209	2	flat	950	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
099a8a47-e4a2-464f-8e98-d4c2b79c872d	F-210	2	flat	675	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
00914807-dc08-48f0-93d0-0b65e79c8336	F-211	2	flat	1000	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
116944c9-0de6-4332-bdc4-737bcbc05e0c	F-212	2	flat	1143	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
04f6afd2-1f63-4afb-9380-a39bfd3769f5	F-301	3	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
db1c7ce0-cd16-449a-bd04-1b32a364d809	F-302	3	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
68c3d194-492d-4516-81b2-93e65e2ea04f	F-303	3	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
27b21933-2d8d-4938-b152-f403a52c54e2	F-304	3	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
fef4d5a6-92c9-453a-9243-e429d373df60	F-305	3	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
23eabb8d-4964-439c-a9f1-b58969f1daab	F-306	3	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
1f0ddac1-fe70-4dd8-9256-30125667cf31	F-307	3	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
b5a5c2bb-5118-47e7-ae0a-f02b0de591ee	F-308	3	flat	810	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
d20586f7-c37f-4ab9-b232-09c891ce0271	F-309	3	flat	950	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
4e73a28f-1591-438d-9d2e-b959b88660dd	F-310	3	flat	675	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
c598dfbc-68cc-407f-8bf3-766ed9ff06f6	F-311	3	flat	1000	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
21d60c8a-5d2c-486d-8899-85ba6b6dff9b	F-312	3	flat	1143	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
556cb626-ad97-43b5-82ba-096346c66a2f	F-401	4	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
b9f72ed8-d550-4968-8020-79b6a3ae5422	F-402	4	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
7edd17c5-3a83-4a67-ad5a-719267ef8e70	F-403	4	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
0689fa0b-15ca-47ea-8383-a83907a1efbe	F-404	4	flat	870	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
f981286d-8cd6-484a-ac57-914ddffd7ea3	F-405	4	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
7dc0e58f-3384-48f8-829e-318bf749cc46	F-406	4	flat	740	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
07c84e3e-9002-4d32-a3cf-e91b82e98790	F-407	4	flat	1026	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
49590d12-a03d-4ff0-9737-eef8f0632dae	F-408	4	flat	810	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
c0493c76-5660-4b50-9a26-9c9357d4d06d	F-409	4	flat	950	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
b78ec36b-d242-4f7c-b672-2ccaf563f9cb	F-410	4	flat	675	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
4dab977d-c83b-4879-9d72-83807a396022	F-411	4	flat	1000	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
c3e136f4-c6fb-4fdb-a10c-aa9cc49bdc84	F-412	4	flat	1143	vacant	2026-06-11 12:30:10.39	2026-06-11 12:30:10.39	1	bb5a6f75-f355-4484-85dd-a6dc55c3418e
db985d60-3bc8-43a1-9b06-7a0d789f7bb7	B-101	\N	bungalow	1000	vacant	2026-06-11 17:23:06.08	2026-06-11 17:23:06.08	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
8ddf515f-b266-4cb3-b930-c98158dac1e8	B-102	\N	bungalow	1000	vacant	2026-06-11 17:23:06.08	2026-06-11 17:23:06.08	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
6dfaac21-c19d-4e36-9a6b-f70981462bbb	B-103	\N	bungalow	1000	vacant	2026-06-11 17:23:06.08	2026-06-11 17:23:06.08	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
a48cf7cb-39eb-4138-8402-a7a76d06320f	B-104	\N	bungalow	1000	vacant	2026-06-11 17:23:06.08	2026-06-11 17:23:06.08	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
c4460847-1f1b-4571-868d-e930d11f26a9	B-105	\N	bungalow	1000	vacant	2026-06-11 17:23:06.08	2026-06-11 17:23:06.08	1	3e1bd21e-9565-48c9-93b9-9f096b94757d
0691843f-a94c-4707-ab58-adccc72d1665	F-101	1	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
0fd3bcdf-17ca-43a2-aca9-a163b5bd2f65	F-102	1	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
11286cb3-37cc-4d01-9c94-66c28973c032	F-103	1	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
bf0c2e79-56d6-4005-ab94-5305e8e3a953	F-104	1	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
89fe4ffc-77f3-46d1-91ac-e80ae1b2c52f	F-105	1	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
2f8aed0b-2e7d-4cf9-a49e-1c41e7240c2f	F-106	1	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
9de3f1f0-c3d2-46e5-82b2-b52abcf19c8e	F-107	1	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
4b460e46-e06f-4992-bbfe-66d40d0da996	F-108	1	flat	810	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
7808a681-7f67-4064-ab6a-cddca03aa167	F-201	2	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
c28dbbe2-d005-4245-81dc-8dfd25e7114c	F-202	2	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
0b2a8438-eb02-4b86-9a97-b87727fc88a2	F-203	2	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
11715502-339e-4087-b26d-f8c1b055b08c	F-204	2	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
8de367ae-f657-4d6f-9539-e1f8f9459d64	F-205	2	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
8977c770-3cb7-4760-88c1-fb3a3972c5e6	F-206	2	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
75019bf2-6de2-42ca-9a42-1e9c1f062bd1	F-207	2	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
054a0bbe-bb13-4c58-a50a-5afe75c58b12	F-208	2	flat	810	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
a49a46e2-4b17-4aab-9c74-4116d19374e6	F-301	3	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
8feed2a4-8676-45ce-a834-cf8a6c3e4cad	F-302	3	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
dfdb4b18-674d-483c-91d5-9a066160a5a3	F-303	3	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
36bbac69-bd9e-483a-9507-08be14280880	F-304	3	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
8c1b7fa5-a4df-4f4a-b7b9-61212547c285	F-305	3	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
a4b26c83-8ee7-4b44-ae91-fda01494f3b5	F-306	3	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
d533365f-08bc-4651-a09e-1b882936778e	F-307	3	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
171104bf-8277-4937-aeee-4bbb33abba86	F-308	3	flat	810	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
50531df9-6425-4c34-9d22-b2f0c30a958a	F-401	4	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
8f48e2a6-03fa-4e08-b5b9-a7d5fa870006	F-402	4	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
124fe8a8-4145-417a-80cb-25a55832ce8b	F-403	4	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
2176ff1c-cdca-453a-aefa-2d398fa9f323	F-404	4	flat	840	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
648c18a0-71ba-4569-84ac-5c1a44919e86	F-405	4	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
c37d92a5-3290-4b13-92c7-261d58d9ece3	F-406	4	flat	740	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
52469386-3f0f-433b-b7bf-1759aadf970b	F-407	4	flat	1026	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
2e273db4-43cb-49f2-900c-69d4f0263575	F-408	4	flat	810	vacant	2026-06-16 04:33:55.09	2026-06-16 04:33:55.09	4	b19d2d55-29d9-4220-b9c2-1d861039730b
a7e061ca-1075-4f74-a65c-e9ea700edd68	109	1	flat	950	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
724fea48-0054-40bb-97dd-301d17bae1f5	110	1	flat	675	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
3ed64660-2249-4f65-b316-a3de05d8b6e7	111	1	flat	1000	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
0980c9a5-fa3d-4c93-b3bf-e1c03fed0de2	112	1	flat	1143	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
de7d2807-dec5-482b-af5a-76afd2ad505e	209	2	flat	950	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
6aa21a5e-3ce6-4c4d-80bf-7a10b4d3b9e1	210	2	flat	675	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
aa283313-4c38-4f44-865d-65becb5f9310	211	2	flat	1000	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
dfea0663-e9a5-4efc-8884-cfc0a232a66d	212	2	flat	1143	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
c9d43197-d59f-4ee6-b9ba-178a2600b109	309	3	flat	950	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
b3946971-e1c4-4fea-bae6-eb7e517dd42f	310	3	flat	675	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
0f369642-c3ec-43b8-8f66-614466944a4e	311	3	flat	1000	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
a92347eb-e1c4-49b1-9845-bff36d253adc	312	3	flat	1143	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
bd9c2c3c-0abf-465e-8e87-a4ab712594a9	409	4	flat	950	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
2693872b-f56b-43ec-ac75-61d2d581ab78	410	4	flat	675	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
2153ec13-b1eb-4cb9-ac4c-000dac54aa9b	411	4	flat	1000	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
6fe617cc-6052-42f3-94fc-171dcddc1100	412	4	flat	1143	vacant	2026-06-16 09:27:07.538	2026-06-16 09:27:07.538	4	d961bc64-15ad-48b0-8567-1f03f6f6ba30
53e8ca48-ceeb-49a0-8014-76b001d155b7	Street 1-101	1	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
3f00be09-4ee2-4156-85fe-6e8f1416c02f	Street 1-102	1	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
6ea3c7eb-6c17-4a08-87b2-fe191b7d576f	Street 1-103	1	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
f42d7859-036e-4d16-832a-d7afe6580604	Street 1-104	1	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
9fe2c546-2ba2-4ad3-a7c8-2233c34bb845	Street 1-201	2	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
71eb0e9b-119f-4912-8ebc-78a8dd9db0a7	Street 1-202	2	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
0ab0978b-932b-4ed6-95d0-c4ed66c44000	Street 1-203	2	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
b32c144d-cb65-48c0-a902-5b14ab70e7b2	Street 1-204	2	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
cb1c17a9-7e9e-46d8-a481-6a51ef2e3b34	Street 1-301	3	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
b1bcd9c2-025b-4569-bbd6-07620520578e	Street 1-302	3	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
384d07e2-e98c-4e39-9d47-304d67671c4c	Street 1-303	3	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
82f2658e-40d1-42a0-b546-479d3c7fe694	Street 1-304	3	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
02ccf8e9-6ebd-4f69-9766-577094f00343	Street 1-401	4	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
2988d6cf-de38-461b-9480-2bd71862ef84	Street 1-402	4	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
f7443e2d-0387-43a7-a463-02fe489b9768	Street 1-403	4	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
a4ff497c-30c9-42cd-94ba-85c52fcd52e4	Street 1-404	4	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
668e99a7-aeb2-4454-b3f2-a3d651c9c885	Street 1-501	5	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
dc9c3862-0055-4c37-98a4-79711a820b89	Street 1-502	5	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
d9dfd19a-c4c7-4ad1-bbcd-3a3d63f2c206	Street 1-503	5	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
bef5a0e1-6a82-4dd3-bcd0-ce2ca954ec18	Street 1-504	5	flat	1000	vacant	2026-06-16 12:02:15.118	2026-06-16 12:02:15.118	8	c366192c-a763-4a50-9b5e-0840c32e40af
c9d0d974-2af0-4c2b-9e06-3cc9eeba3dce	101	1	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
f8f2df4f-32c0-4955-b1ae-207a2f7effd3	102	1	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
373496b3-3a54-4a72-9550-8adbc195c071	103	1	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
c458286b-de7b-42f6-bb3f-d7e533c617da	104	1	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
357a39dc-fe97-4b1c-aa3d-2638d561f109	201	2	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
fbfe39bb-f017-43c3-bb65-df0d5790d716	202	2	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
4dfefda6-7265-4255-ac07-41406f4ebadb	203	2	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
341b6689-aba8-4cff-a975-028bd8c5268d	204	2	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
1047cb54-daa7-4620-9184-3c09762f6432	301	3	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
12af88b9-e595-48f1-a92e-56e6ead8293c	302	3	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
888235fa-c2b9-4f02-86bd-168bced9144a	303	3	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
ae83815e-79b1-4981-bedb-ad130dd6da2e	304	3	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
eca80f58-ad35-4a9b-8545-614cff544978	401	4	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
dc507463-b57d-4c6e-a93f-6d3b6c4387fa	402	4	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
b1b3471a-bf72-45d7-a968-6f7c89623fdb	403	4	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
b2aebdc4-768f-4c7e-afba-ec4265704219	404	4	flat	1000	vacant	2026-06-16 15:01:47.306	2026-06-16 15:01:47.306	10	900660a1-0875-4a0e-95c9-5e552b982dd2
7624767d-e6d5-4852-bc30-d4caaf34d9bf	Wing B-110	1	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
535ac6e5-785f-4b06-a211-234ad24933e8	Wing B-111	1	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
8fbfd074-3d88-4d4b-8bee-f5f2248ffa96	Wing B-112	1	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
9e7ff0ac-73af-4b37-875d-1613d50e016d	Wing B-209	2	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
547b2484-0fdb-41c2-a7b9-15f9c1d2f60c	Wing B-210	2	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
2a0d660d-7b11-4609-a9cf-69e8c7fa3a9c	Wing B-211	2	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
f3208cd4-de1b-4f2c-b6ac-55c8a9e1f61c	Wing B-212	2	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
ffb5e0b9-018e-4ed7-ad12-d630186897c3	Wing B-309	3	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
0a10081f-ecfb-473c-b2fc-0ff5179db286	Wing B-310	3	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
1816e1d9-ed07-491e-b26d-6b6140673828	Wing B-311	3	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
f3054395-7961-4976-a271-4dcb3157d712	Wing B-312	3	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
8bdedff6-b310-44a8-ade4-0ef532ac606b	Wing B-409	4	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
8af81482-14f3-42f8-a623-7ac9da9762f7	Wing B-410	4	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
eabc42d0-e574-4c3b-9680-d11f599293a1	B-106	1	flat	1250	occupied	2026-07-03 12:59:01.924	2026-07-03 12:59:01.985	12	\N
3517b4f7-632f-4745-92e6-2adc2651ebcf	Wing B-411	4	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
61858c41-43fa-4c5e-b76f-635efa41e78c	Wing B-412	4	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
f3e061f8-20d2-465a-a6f4-cbf221ad8a18	Wing B-509	5	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
c86fa7f5-6407-41af-b38a-7147cb29a796	Wing B-510	5	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
88ed44c2-f060-45a1-9063-df3696146d5d	Wing B-511	5	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
47fe1587-7b29-47d9-ab28-80306fc38cd4	Wing B-512	5	flat	1000	vacant	2026-06-16 15:03:52.877	2026-06-16 15:03:52.877	10	96703a6c-5688-411e-9759-b08cb4e25343
031546ee-e650-4153-8f4c-1fc7f14d9e6c	Wing B-109	1	flat	1000	occupied	2026-06-16 15:03:52.877	2026-06-27 08:53:05.599	10	96703a6c-5688-411e-9759-b08cb4e25343
397a9657-0b10-4afa-99d1-5c08f2e880c6	A-601	6	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
73923ea4-0ac6-460a-bd7d-3dbc517ae921	A-602	6	flat	1200	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
93c69f74-387e-4309-beec-ab10f7a4bdcc	A-603	6	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
e4ea6e31-bfbf-4552-9846-a7dce664f080	A-604	6	flat	1500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
6a97a67d-336a-4be6-9c0e-a85ac6af887b	A-605	6	flat	2000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
06fe8c99-4130-4ecb-a790-c7534c73413b	A-606	6	flat	2500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
e325066b-6897-4e63-8161-ed0b345dd604	A-701	7	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
aecd0376-22f3-431d-88c6-06413b19d186	A-702	7	flat	1200	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
b7caaddc-a9e2-4d3b-a42b-0a73f4521631	A-703	7	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
f3e78d72-a53d-497b-9ebc-274843d994d0	A-704	7	flat	1500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
6e7a1e8f-eff8-4420-a79d-71197fb0e578	A-705	7	flat	2000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
0e817c73-30ae-4fc0-b608-addeb34c9d05	A-706	7	flat	2500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
015c39fc-d102-4a90-b1e8-668f555c4aa7	A-103	1	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.454	12	2e22c027-afc1-44a5-927f-75d91eb354ac
22d6b732-65c2-4668-a83a-52b7bac56cdf	A-104	1	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.523	12	2e22c027-afc1-44a5-927f-75d91eb354ac
58215653-c025-4bec-838a-0d9b3c6612ec	A-105	1	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.592	12	2e22c027-afc1-44a5-927f-75d91eb354ac
50d1ecd6-c35d-423c-a363-f9ddc4157e5d	A-106	1	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.664	12	2e22c027-afc1-44a5-927f-75d91eb354ac
a9197ab3-8dab-4cf8-baf9-db9f6097ebeb	A-201	2	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.996	12	2e22c027-afc1-44a5-927f-75d91eb354ac
c0493c68-83bc-4d09-b8f0-b1c9c6ca7efd	A-202	2	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.062	12	2e22c027-afc1-44a5-927f-75d91eb354ac
fc9bd77b-9388-48fd-8c94-57f93fa3a5db	A-203	2	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.128	12	2e22c027-afc1-44a5-927f-75d91eb354ac
134ce985-f64c-423b-a5e2-d8419dde5535	A-204	2	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.194	12	2e22c027-afc1-44a5-927f-75d91eb354ac
9125e256-6bad-4fc6-8507-465c9a4e8280	A-205	2	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.261	12	2e22c027-afc1-44a5-927f-75d91eb354ac
6acab449-31dd-4aa4-b3d4-94a0e804d3ac	A-206	2	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.326	12	2e22c027-afc1-44a5-927f-75d91eb354ac
b2731bf3-c10f-46a5-8a98-e16e2bb7dd82	A-301	3	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.661	12	2e22c027-afc1-44a5-927f-75d91eb354ac
0b98ca1a-1e0b-42ab-827a-c66388df288e	A-302	3	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.728	12	2e22c027-afc1-44a5-927f-75d91eb354ac
5c310f84-c23e-4c2e-a0b2-0511bacc7027	A-303	3	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.794	12	2e22c027-afc1-44a5-927f-75d91eb354ac
c781c795-c7b0-425b-843d-a793d5885ee7	A-304	3	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.861	12	2e22c027-afc1-44a5-927f-75d91eb354ac
1341ab46-7c6f-407e-b9d4-e8b1b205a9f3	A-305	3	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.929	12	2e22c027-afc1-44a5-927f-75d91eb354ac
1cc450f2-f4f4-4a36-a77b-d1b7c1fe091c	A-306	3	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:59.995	12	2e22c027-afc1-44a5-927f-75d91eb354ac
b697cacf-7aac-4c54-b847-4259c43347ac	A-401	4	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.329	12	2e22c027-afc1-44a5-927f-75d91eb354ac
8dd6482b-44c8-4932-9387-0d9c759a0fa2	A-402	4	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.392	12	2e22c027-afc1-44a5-927f-75d91eb354ac
ccf3e5b1-b05b-42e8-807a-aa697c9beab8	A-403	4	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.457	12	2e22c027-afc1-44a5-927f-75d91eb354ac
71d7efbf-5dc6-44dc-a7b4-8d4c4e1a612a	A-404	4	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.523	12	2e22c027-afc1-44a5-927f-75d91eb354ac
94c471a4-8548-4f56-a18c-aa9df1de893e	A-405	4	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.596	12	2e22c027-afc1-44a5-927f-75d91eb354ac
36451262-4117-4d12-84b3-5c16b9cebc27	A-406	4	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.668	12	2e22c027-afc1-44a5-927f-75d91eb354ac
2db48490-f13d-4cdb-b762-bf3b191fe490	A-501	5	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:00.996	12	2e22c027-afc1-44a5-927f-75d91eb354ac
2d28cf72-41dc-4382-aea9-c452474ad64e	A-502	5	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:01.061	12	2e22c027-afc1-44a5-927f-75d91eb354ac
c21d098a-22ea-4234-b38f-8f3c91384f48	A-503	5	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:01.128	12	2e22c027-afc1-44a5-927f-75d91eb354ac
45985f42-bc1f-47ae-be3f-6e98096311e2	A-504	5	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:01.192	12	2e22c027-afc1-44a5-927f-75d91eb354ac
839749a1-6f4a-46b1-a406-1029274bb2cf	A-505	5	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:01.258	12	2e22c027-afc1-44a5-927f-75d91eb354ac
1c558af1-b2e7-45f8-a34a-16bd94d7c355	A-506	5	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:59:01.324	12	2e22c027-afc1-44a5-927f-75d91eb354ac
3a4d9dc9-6dc2-4cfc-9e13-8132177b0e4c	A-801	8	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
50ec56ee-db4e-4e51-9f83-511455c048b9	A-802	8	flat	1200	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
78d348ea-a21c-4a8c-b45e-f8fb9976664a	A-803	8	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
d4135690-4156-4f79-93f3-df4e567b3394	A-804	8	flat	1500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
10c6adb3-5fc1-4fc2-9781-9ad9c5d744b9	A-805	8	flat	2000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
f9db41c7-4066-4051-b020-12eb07784171	A-806	8	flat	2500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
adf6b3e7-6c2a-4fab-bdd3-560261a55ac1	A-901	9	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
b8e5179d-85ba-4a55-83f1-34673700ab26	A-902	9	flat	1200	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
615a779f-3b2f-4fdf-b1e5-2d29273a17ee	A-903	9	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
3a664fee-4d12-45a9-84ab-cb0f43109343	A-904	9	flat	1500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
ba6c2e3c-74ef-4634-8b14-799fab5e592e	A-905	9	flat	2000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
77b90802-5931-4a59-bf56-ca235e8d9dc9	A-906	9	flat	2500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
9c9313cd-1936-4537-bcbe-cd8ea37f294c	A-1003	10	flat	1000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
31d042e3-b611-4cf7-8818-2a232d43a37b	A-1004	10	flat	1500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
167da63b-204a-4cd3-90e9-0ad57878a882	A-1005	10	flat	2000	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
d9f447e8-7571-4082-8efb-aac810b2c216	A-1006	10	flat	2500	vacant	2026-07-02 10:08:24.609	2026-07-02 10:08:24.609	12	2e22c027-afc1-44a5-927f-75d91eb354ac
a5af25e8-39ed-4cc7-aa1c-e17ac926dc8d	A-210	1	flat	1250	occupied	2026-07-03 12:58:59.536	2026-07-03 12:58:59.593	12	\N
773bd0bb-f52a-4561-98ad-cd040ecbd694	A-1001	10	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-02 13:22:49.191	12	2e22c027-afc1-44a5-927f-75d91eb354ac
0fcf4029-601b-4966-9d33-88623775fd38	FLAT-402	4	flat	1000	vacant	2026-07-02 14:38:32.216	2026-07-02 14:38:32.216	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
58367c1f-2066-4b50-aba3-dd11c325f0db	FLAT-101	1	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-02 14:40:03.696	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	FLAT-102	1	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.779	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
0271539f-8a09-4bc5-8954-628415ed3971	A-101	1	flat	1000	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.303	12	2e22c027-afc1-44a5-927f-75d91eb354ac
79e2f043-4198-4714-9f23-2739aeef96cb	A-102	1	flat	1250	occupied	2026-07-02 10:08:24.609	2026-07-03 12:58:58.379	12	2e22c027-afc1-44a5-927f-75d91eb354ac
c968a093-2335-4021-b46b-83b3ff259092	A-107	1	flat	1000	occupied	2026-07-03 12:58:58.673	2026-07-03 12:58:58.729	12	\N
c5c32892-6cc2-4d91-b700-69e72cacca0a	A-108	1	flat	1250	occupied	2026-07-03 12:58:58.738	2026-07-03 12:58:58.795	12	\N
eb8b5263-f0d6-4078-ab29-13ef3f0e4d19	A-109	1	flat	1000	occupied	2026-07-03 12:58:58.804	2026-07-03 12:58:58.862	12	\N
295d28cf-1700-45fd-be32-d08bc76f802f	A-110	1	flat	1250	occupied	2026-07-03 12:58:58.87	2026-07-03 12:58:58.93	12	\N
3209c85b-674f-4c09-ae62-2e8f85a0d7a7	A-207	1	flat	1000	occupied	2026-07-03 12:58:59.335	2026-07-03 12:58:59.392	12	\N
be76b827-1cae-4e42-993a-be5e009bb098	A-208	1	flat	1250	occupied	2026-07-03 12:58:59.402	2026-07-03 12:58:59.458	12	\N
21bedbf1-183e-455c-8d02-688afe94e192	A-209	1	flat	1000	occupied	2026-07-03 12:58:59.468	2026-07-03 12:58:59.525	12	\N
dac28408-01de-4fd2-85f0-49e03b506c12	A-307	1	flat	1000	occupied	2026-07-03 12:59:00.003	2026-07-03 12:59:00.062	12	\N
7dca1382-40fc-4273-b715-ee17849c1407	A-308	1	flat	1250	occupied	2026-07-03 12:59:00.071	2026-07-03 12:59:00.128	12	\N
14a81fe0-7e65-434c-b41a-3191f085ad86	A-309	1	flat	1000	occupied	2026-07-03 12:59:00.137	2026-07-03 12:59:00.197	12	\N
f3843f85-917b-475d-b51c-31f0877ed8ff	A-310	1	flat	1250	occupied	2026-07-03 12:59:00.206	2026-07-03 12:59:00.263	12	\N
783b71dd-fc28-4671-8313-209f02919a46	A-407	1	flat	1000	occupied	2026-07-03 12:59:00.676	2026-07-03 12:59:00.732	12	\N
e56f88f7-ae5b-49ff-8cf8-e383b70fb9c9	A-408	1	flat	1250	occupied	2026-07-03 12:59:00.74	2026-07-03 12:59:00.798	12	\N
55a280c8-037e-4f6f-bbd1-e6fd44cb5120	A-409	1	flat	1000	occupied	2026-07-03 12:59:00.807	2026-07-03 12:59:00.863	12	\N
3a9d7e72-c992-46ce-bfb0-962ea1f02e13	A-410	1	flat	1250	occupied	2026-07-03 12:59:00.872	2026-07-03 12:59:00.928	12	\N
684e6f88-20b0-478a-887c-3059ad52189b	A-507	1	flat	1000	occupied	2026-07-03 12:59:01.334	2026-07-03 12:59:01.389	12	\N
67591685-8002-4806-9d19-f602f856e143	A-508	1	flat	1250	occupied	2026-07-03 12:59:01.398	2026-07-03 12:59:01.454	12	\N
091e0ffa-a9e6-45ae-b981-17a1d38d13f6	A-509	1	flat	1000	occupied	2026-07-03 12:59:01.463	2026-07-03 12:59:01.52	12	\N
5d009904-d998-448f-a525-6aef713d9748	A-510	1	flat	1250	occupied	2026-07-03 12:59:01.529	2026-07-03 12:59:01.587	12	\N
975bfc40-4584-49b2-a83d-a6ee907534cc	B-101	1	flat	1000	occupied	2026-07-03 12:59:01.598	2026-07-03 12:59:01.654	12	\N
dcf0b2c9-203f-4b69-aad1-fa90d93d7c75	B-102	1	flat	1250	occupied	2026-07-03 12:59:01.663	2026-07-03 12:59:01.72	12	\N
3451acad-8727-4ac2-ae72-444e61e77118	B-103	1	flat	1000	occupied	2026-07-03 12:59:01.728	2026-07-03 12:59:01.785	12	\N
416d2f3a-e58e-4c63-a5fa-035823c87f2e	B-104	1	flat	1250	occupied	2026-07-03 12:59:01.794	2026-07-03 12:59:01.85	12	\N
acacb9cb-359f-4879-a8c8-063cf165ec77	B-105	1	flat	1000	occupied	2026-07-03 12:59:01.858	2026-07-03 12:59:01.915	12	\N
578871c5-0ff0-4027-a537-138184049557	FLAT-201	2	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.815	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
65edb33b-17c8-4771-9e62-2f4689bea775	FLAT-202	2	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.841	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
96e6b65b-d3c9-4d30-b3c2-c745f75e34a7	FLAT-301	3	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.868	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
0b0b8ca1-7c84-40ba-90d9-0837f83ad032	FLAT-302	3	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.9	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
f37e5c20-e834-4aa7-be9e-a8fbdf94e8b5	FLAT-401	4	flat	1000	occupied	2026-07-02 14:38:32.216	2026-07-03 15:16:04.929	13	d7c45dc5-e479-4f81-b1e6-270632c3fec3
c22c17f5-73ac-4c60-bf0a-fe9bf6fc6b04	B-107	1	flat	1000	occupied	2026-07-03 12:59:01.995	2026-07-03 12:59:02.051	12	\N
060a5985-8591-4879-9161-4d019f6a3ab1	B-108	1	flat	1250	occupied	2026-07-03 12:59:02.064	2026-07-03 12:59:02.122	12	\N
c11db0f7-2963-411f-8231-62060a62fb92	B-109	1	flat	1000	occupied	2026-07-03 12:59:02.131	2026-07-03 12:59:02.188	12	\N
f92b5748-42a0-4ace-8ea1-c3e9f858b2d1	B-110	1	flat	1250	occupied	2026-07-03 12:59:02.197	2026-07-03 12:59:02.254	12	\N
07f9e198-7645-46ce-bfc0-5c5e0ff77dec	B-201	1	flat	1000	occupied	2026-07-03 12:59:02.265	2026-07-03 12:59:02.323	12	\N
bb03cf93-7122-45b8-8da9-afd0265b4b7f	B-202	1	flat	1250	occupied	2026-07-03 12:59:02.333	2026-07-03 12:59:02.391	12	\N
de899136-7066-4ed0-b745-fa713f12456d	B-203	1	flat	1000	occupied	2026-07-03 12:59:02.401	2026-07-03 12:59:02.456	12	\N
ae3ef16a-51c9-4703-bd69-829d8cf92eb3	B-204	1	flat	1250	occupied	2026-07-03 12:59:02.465	2026-07-03 12:59:02.521	12	\N
e8dd5447-e8d3-4e88-98b5-9a6bddd0a06a	B-205	1	flat	1000	occupied	2026-07-03 12:59:02.531	2026-07-03 12:59:02.588	12	\N
d71e8e40-b325-42c2-a37e-8b123578743a	B-206	1	flat	1250	occupied	2026-07-03 12:59:02.598	2026-07-03 12:59:02.664	12	\N
93719735-ad2b-424b-9cb8-5b7d29e9df1a	B-207	1	flat	1000	occupied	2026-07-03 12:59:02.675	2026-07-03 12:59:02.734	12	\N
d3b0c60c-35c3-4e62-b511-6edcad3be9c8	B-208	1	flat	1250	occupied	2026-07-03 12:59:02.745	2026-07-03 12:59:02.805	12	\N
ccef5571-4974-4136-87f7-e9a4b969f33c	B-209	1	flat	1000	occupied	2026-07-03 12:59:02.815	2026-07-03 12:59:02.875	12	\N
e0c2014a-99b4-40d6-847d-15a723a17ee8	B-210	1	flat	1250	occupied	2026-07-03 12:59:02.884	2026-07-03 12:59:02.942	12	\N
03625b67-e6b3-4d54-8c20-93970a91e485	B-301	1	flat	1000	occupied	2026-07-03 12:59:02.952	2026-07-03 12:59:03.013	12	\N
b736a4b4-c916-40c3-aab6-57b577922d27	B-302	1	flat	1250	occupied	2026-07-03 12:59:03.022	2026-07-03 12:59:03.081	12	\N
85ac5b04-ee02-41ee-a1ec-0ca363468866	B-303	1	flat	1000	occupied	2026-07-03 12:59:03.089	2026-07-03 12:59:03.146	12	\N
c4078200-8cb4-471a-8257-a98f7a43cdb1	B-304	1	flat	1250	occupied	2026-07-03 12:59:03.154	2026-07-03 12:59:03.211	12	\N
8c5b7b7f-bb25-4be6-9aa1-0d1726018236	B-305	1	flat	1000	occupied	2026-07-03 12:59:03.221	2026-07-03 12:59:03.279	12	\N
e3f40e01-9f23-4c59-92e1-dbc746702b32	B-306	1	flat	1250	occupied	2026-07-03 12:59:03.286	2026-07-03 12:59:03.343	12	\N
b63a9500-68c5-49fd-8ae9-9e8d190dc650	B-307	1	flat	1000	occupied	2026-07-03 12:59:03.351	2026-07-03 12:59:03.407	12	\N
e9408249-4b89-4604-a245-99d03f4e5c22	B-308	1	flat	1250	occupied	2026-07-03 12:59:03.417	2026-07-03 12:59:03.476	12	\N
07f466b5-2439-4137-bd1a-3beff11ff6da	B-309	1	flat	1000	occupied	2026-07-03 12:59:03.487	2026-07-03 12:59:03.548	12	\N
050cf58c-6bf3-4654-8ce5-96424690c617	B-310	1	flat	1250	occupied	2026-07-03 12:59:03.561	2026-07-03 12:59:03.633	12	\N
7deff147-8ae3-4602-9395-3598923df190	B-401	1	flat	1000	occupied	2026-07-03 12:59:03.645	2026-07-03 12:59:03.713	12	\N
c375af80-892f-4f5a-aede-f9972d32bb95	B-402	1	flat	1250	occupied	2026-07-03 12:59:03.725	2026-07-03 12:59:03.794	12	\N
0474c2be-e414-4a0d-81b6-4181fd55c27d	B-403	1	flat	1000	occupied	2026-07-03 12:59:03.803	2026-07-03 12:59:03.862	12	\N
b086787f-410f-4ce2-b508-db5a4a8cd1bf	B-404	1	flat	1250	occupied	2026-07-03 12:59:03.868	2026-07-03 12:59:03.924	12	\N
3d75f7f0-98ed-4db3-b2dc-763eaf6cb262	B-405	1	flat	1000	occupied	2026-07-03 12:59:03.932	2026-07-03 12:59:03.99	12	\N
6efec2a2-d302-481d-98d9-8510e0d3c8f9	B-406	1	flat	1250	occupied	2026-07-03 12:59:04.001	2026-07-03 12:59:04.057	12	\N
32c46f11-5ccc-4409-9dc6-a684a240a49b	B-407	1	flat	1000	occupied	2026-07-03 12:59:04.066	2026-07-03 12:59:04.121	12	\N
138828af-e053-40da-8ef9-516585732357	B-408	1	flat	1250	occupied	2026-07-03 12:59:04.128	2026-07-03 12:59:04.186	12	\N
c4695bb0-0e70-4a4b-a8c3-7c4118319b01	B-409	1	flat	1000	occupied	2026-07-03 12:59:04.195	2026-07-03 12:59:04.249	12	\N
77f55918-aa60-47b3-b989-49026574f9bf	B-410	1	flat	1250	occupied	2026-07-03 12:59:04.257	2026-07-03 12:59:04.313	12	\N
3e62c1d2-6958-4f94-b83f-8ef468c9f969	B-501	1	flat	1000	occupied	2026-07-03 12:59:04.319	2026-07-03 12:59:04.374	12	\N
79fce540-20bb-42a2-91e6-287ab026c669	B-502	1	flat	1250	occupied	2026-07-03 12:59:04.384	2026-07-03 12:59:04.439	12	\N
4964a392-db3b-4453-8d8d-39a3394ef814	B-503	1	flat	1000	occupied	2026-07-03 12:59:04.447	2026-07-03 12:59:04.503	12	\N
fc24ebac-d6a4-4779-88bc-dd55a46e93d6	B-504	1	flat	1250	occupied	2026-07-03 12:59:04.512	2026-07-03 12:59:04.567	12	\N
81adc3fd-a3e7-4d4f-96ef-87a80bd0af27	B-505	1	flat	1000	occupied	2026-07-03 12:59:04.574	2026-07-03 12:59:04.631	12	\N
edb88c52-d244-44e8-8acb-531742bc08cb	B-506	1	flat	1250	occupied	2026-07-03 12:59:04.639	2026-07-03 12:59:04.698	12	\N
87b69f77-2c3a-4b3a-8dbc-304000bc3ca4	B-507	1	flat	1000	occupied	2026-07-03 12:59:04.705	2026-07-03 12:59:04.762	12	\N
58ec8846-096c-45a9-90a1-08387f820ecb	B-508	1	flat	1250	occupied	2026-07-03 12:59:04.771	2026-07-03 12:59:04.827	12	\N
2279692f-a6ad-416b-8ba8-2691d6264675	B-509	1	flat	1000	occupied	2026-07-03 12:59:04.835	2026-07-03 12:59:04.891	12	\N
574888af-4edb-4ec0-a571-d50afb35a245	B-510	1	flat	1250	occupied	2026-07-03 12:59:04.899	2026-07-03 12:59:04.956	12	\N
ee031c91-748a-425c-86b6-591352a460ca	A-1002	10	flat	1200	occupied	2026-07-02 10:08:24.609	2026-07-03 14:38:03.593	12	2e22c027-afc1-44a5-927f-75d91eb354ac
3f022619-2e2b-499b-a979-b6732c3bc84b	101	1	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ae2a749e-9bdc-4b45-98db-7fa8fc69a160	102	1	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
7ab29bbb-c3d1-4474-a672-e8d5fa9dff5c	103	1	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
21257825-f999-4333-bfd1-72b7f6380383	104	1	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
17d5fb5a-5c35-4af7-a018-6e9cdda1e750	105	1	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b0de4a81-472f-4867-8996-c05d1f4587df	106	1	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b3d31fd0-db35-47f7-87cd-8483449c8640	107	1	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
69ae8258-7081-49bd-8678-73ab8e0ec729	108	1	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
d4039bde-c1fa-4946-a0d3-585b0b79178f	201	2	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b8a3e471-ef65-4c09-b1e1-8931354e0ecd	202	2	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
7531cb3a-4941-42bf-ae13-aa729171f00b	203	2	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
12fa33f4-38b6-492b-903e-51ea13ad030d	204	2	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
05358fe5-7dc2-4c53-9656-d20c5f5ef3c4	205	2	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
df114fb0-48ef-4b1a-9904-b7d2b0cd9b16	206	2	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
794e04fc-2cc3-406f-ba40-d5bd4962f7fc	207	2	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
0261e042-4731-4ec1-be15-7b3de94eae58	208	2	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b559f1de-8c92-49d4-8c8f-ec84cf774f71	301	3	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a4458d96-92c4-4bb3-9bb1-3de19a728658	302	3	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a8c87c03-d146-44fa-afd4-d3d8a38280e3	303	3	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
c25ba662-1aba-483f-b187-e2298d96e40d	304	3	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
9e94f3bc-1fae-4482-9ef5-a274f95567c5	305	3	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
e56196d3-2b1c-4517-a082-99752d11adb0	306	3	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
3e512404-0a21-47bd-bc22-5ea2129f769e	307	3	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
e368dfc2-bd59-4109-87a7-efde092fcd24	308	3	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
bef965f9-1f7e-4398-a064-3833cfefbf96	401	4	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
89121333-2596-4e98-bf7f-b694d737cb1f	402	4	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
e5267f5b-f4f6-49db-9891-1851c37d1fc9	403	4	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
14540fe7-aaaa-4fed-8668-90256be1afe1	404	4	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
296dede0-5bfa-49dc-8bb7-aa288713e9ff	405	4	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a1b03df5-f5cf-4c6e-b6f9-4613fed94b4f	406	4	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
705e566a-79f7-463d-86be-7786c0d07aa8	407	4	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
97bc2f6d-e800-4a40-ba23-26cea63db943	408	4	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a00a6deb-bec3-432c-b54a-68f7752a30f6	501	5	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
47d4682c-041b-4902-815c-ab4abdfcb859	502	5	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
e2cf81a3-df36-4aa3-a1ee-4ae181d664b7	503	5	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
c3c90644-a8b6-48cd-aafe-3b997e125685	504	5	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
0120d6c0-c7f9-4874-9818-28bff7a79916	505	5	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
5e90355a-74da-49b9-a328-fcbfbe4a12e1	506	5	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
d0e2bf39-ace2-4be6-b6aa-3f7a54e48126	507	5	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
9eabf866-38e3-4a89-92b8-3a9bbf31686a	508	5	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ca4a2e05-064b-4e79-8d60-2ffedd6fbe7a	601	6	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
03a6ea4a-e16a-40fb-a647-ac34cdcdaf46	602	6	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
5e60d9b0-8131-4e58-b4f7-daef8c3f52b1	603	6	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
8b1fd989-99b0-479c-9c99-ccaa377d228e	604	6	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b19e02ad-1afb-4b45-bfcc-dda219cbe58d	605	6	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
207576f8-3c57-4508-9ac0-4d9b896a1aa4	606	6	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
040b9495-fadb-4c23-baee-5842c89f3e58	607	6	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
bbb24367-bbfa-4e47-be48-601368db3eab	608	6	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
8f960614-4610-41b1-ad8a-ccbece084425	701	7	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
faf81923-a09f-4a61-bee0-9da0d789ce49	702	7	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
93a77835-e5a3-45b7-b5fa-af7ad543e2ce	703	7	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
d750f1d4-36dc-4d04-b3a0-37a555185481	704	7	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ba0fe489-6449-4cf5-b983-88ecf41eaac1	705	7	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
04f8ae0f-0518-4b28-9d71-64fe3bc42d88	706	7	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
8be7fbd3-519b-4629-986b-555b3892015e	707	7	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
25c00d34-0a5a-4163-a592-6a2809d0f4eb	708	7	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
85579b6b-a275-4ef9-b139-8643cdf053b8	801	8	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
f8c9404d-dc9c-4b76-bbf1-f143525f5883	802	8	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
2016595a-88e9-4258-8d7c-af9a188b238d	803	8	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
f1d3eec0-bc03-4aba-be47-9b55638ac04b	804	8	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
fee4d08e-52e4-47cd-854e-b13d996f236b	805	8	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
0514a363-ddc8-4fdc-af86-70c2b2025710	806	8	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
d8cc71c4-155a-40b4-b667-385dc4e5da14	807	8	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
8d90d23f-3bfa-4c46-8f1d-f1d0904d254a	808	8	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
f5c201da-dc1e-4e98-9fd9-a83051e039b4	901	9	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
613d6c9b-f6b2-4984-a458-9f1027704f31	902	9	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
264887b5-8e83-436f-9dd7-3eeca51fe542	903	9	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
54cb39ff-7b7c-4eaa-85d5-307fa4f23b71	904	9	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a166befe-1112-41f4-817f-418ce0d68fe5	905	9	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
49f10acb-50dd-42cb-89a9-5811d4a0cede	906	9	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
bba13294-ca72-4748-9a19-2867ce091cb9	907	9	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
2a6190bc-adf4-4e01-8758-fffcf27c79a4	908	9	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b98038cc-53e2-41d2-bf66-684eafd5b823	1001	10	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
7e95c330-ce10-42c0-9550-c14abd6f63c2	1002	10	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
fdf74e91-92c1-4b27-95d4-20e13b51db55	1003	10	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
a55cd1ac-e714-42e0-b210-2ac34526ad4c	1004	10	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
d3c93a52-6e4a-4544-a471-c2c2f69175f5	1005	10	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
1c432da3-a6e0-4c0e-ba0e-9324a85aba70	1006	10	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
3fe0f848-8100-4e14-849d-ae13c343a4f0	1007	10	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
18a98e64-4557-46e0-9ca0-9ab9dabf30a5	1008	10	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
eb44f6e6-be52-4959-a946-5603d12b03d4	1101	11	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
14a1ef60-8571-47c1-b380-5eed79b6519e	1102	11	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
7ed51832-cb9b-4f52-9658-226b5a834312	1103	11	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
22d864e3-fbd1-496b-a8f9-b9bdbfeea586	1104	11	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
13f38ea1-5411-4dee-89ae-7c2273e309e1	1105	11	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
fa9db1ac-c966-440e-bd0d-3d1e30f1ac59	1106	11	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
5510b085-c25b-481c-a7c5-cb591cacaf14	1107	11	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
804b2bc4-d33d-4f67-b0c2-9abdb25d0eb1	1108	11	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b739e9d2-43d7-438a-87bc-d27bad84d07c	1201	12	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ed021993-fc6d-41c7-b045-027e895b4c1a	1202	12	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
b2b2856c-5b47-48a9-b9ff-6ab27496597c	1203	12	flat	1500	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
2af3afaf-4d61-4fdc-a039-6fe401e83ddb	1204	12	flat	1200	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
671b15cd-f7d3-4999-b9c7-ad397146f946	1205	12	flat	1000	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
e26dfd62-d223-4777-b5ce-ed329597be59	1206	12	flat	800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ebd271e9-3711-4bc6-a0bb-e6b8c95ca8a4	1207	12	flat	1750	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
ca89e65b-44b4-47f5-86bc-82bab15c2dfa	1208	12	flat	1800	vacant	2026-07-11 09:21:34.928	2026-07-11 09:21:34.928	15	85f43a77-1926-4d3d-89f2-154ccd4a184f
23e3d785-595b-4b73-9fbe-48b87e3895e0	101	1	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
51e58d59-f417-4068-a200-039f9b9e785a	102	1	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
d4075116-5391-48c7-b482-1e2d0749044d	103	1	flat	870	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
dc35e9d2-afd7-40c6-ab9d-90238be5b2b4	104	1	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
8941da28-bed2-4f75-a849-fbb740a5bd9e	105	1	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
48e7beef-68ed-4f63-a0ec-981ad8accb9e	106	1	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
f9029ab4-a1dd-43e5-8a2c-7729f6f894b7	107	1	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
666c7932-6994-494f-87f6-cf8682a84489	108	1	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
19f6f3eb-1fad-4235-8ec1-f7062aa8b861	109	1	flat	950	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
df2d07e0-9b0f-4ef1-a395-d034ec0e6104	110	1	flat	675	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
f0abbeaf-aab2-45ec-9b4b-f922ef1295b8	111	1	flat	1000	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
ff3a91d3-8d59-48e8-9d56-a143d1329901	112	1	flat	1143	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
1c10e98a-e8e8-49da-866e-6a393b7addfd	201	2	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
4ddddcc4-f1ca-4d7f-a8f7-deeedd4d0ea8	202	2	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
c8bf77c6-8336-4412-b20b-f849fcbe595a	203	2	flat	870	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
b4389de5-2927-4a6a-80ec-7762bf5ee980	204	2	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
f66baeb7-ea30-4a22-b643-9d9f41d5b933	205	2	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
4dd402f1-f1ed-4c93-b59e-3ae347a3d3a1	206	2	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
58ccae2e-64b4-448c-b5d6-b49fdf93e67f	207	2	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
c95f5768-e458-4264-b7c5-5d27cd91422f	208	2	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
880437d7-91f8-4b44-af81-497358f79fc3	209	2	flat	950	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
56afbb3d-4202-4248-a460-10dd0b0f521e	210	2	flat	675	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
a026dab9-8280-4d86-9aaf-15afbe4cbfcd	211	2	flat	1000	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
bcb018e7-705a-4bc7-8bd5-f24850273aea	212	2	flat	1143	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
713ef296-24bf-43e8-9898-3192d391088a	301	3	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
1b336b50-6f06-4e27-8068-232a29728aed	302	3	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
1a46326a-e6b4-44f4-ba4f-32d494cb3541	303	3	flat	870	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
6feff152-d1be-4ba3-a242-4e0c262b4618	304	3	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
ade97ec2-7c79-442a-8dcc-5bd56b3b2585	305	3	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
0acb020d-d511-45ab-be7b-c85a79a68e3a	306	3	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
95a5d88e-9d94-4ac9-b516-33dcd071fa2b	307	3	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
355a5f16-39c7-4f61-bfa2-18427bffca42	308	3	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
abfac9cd-a1a0-4fa8-a215-e5b3ef432d0a	309	3	flat	950	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
4f7ba15d-752b-45fa-8ed1-a855fc2c32f3	310	3	flat	675	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
f7c02fc9-96b8-41ba-aa54-5870b39bd336	311	3	flat	1000	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
c6438e3c-b33b-4cc6-8655-087664a2d01a	312	3	flat	1143	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
921db599-8b59-4b9c-8a79-6ca363ef473e	401	4	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
63f07308-5ffa-468a-9c3a-763ad68703b5	402	4	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
7b07b2ca-5f4e-40dd-8f60-839e0e5a9ada	403	4	flat	870	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
cda42ea1-1cff-4d6b-b4c3-b100a228150a	404	4	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
801c2940-bb54-4b5e-92f5-78141ba8a007	405	4	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
529ba784-0891-40ce-93e1-cc3c981b8af3	406	4	flat	740	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
4f816e53-06b7-4204-83fd-92c790891041	407	4	flat	1026	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
a2b32ffb-c388-46c5-9bde-6a6599bd36d8	408	4	flat	840	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
01c890cb-8238-4084-bb66-4efeacb8dbb7	409	4	flat	950	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
a7b47708-aea3-4619-aec3-c105b4bc75f3	410	4	flat	675	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
ab6056f6-6131-4118-8220-fbf37ec4fb20	411	4	flat	1000	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
57e5e600-285f-48af-80d2-8724333d475d	412	4	flat	1143	vacant	2026-09-12 16:13:02.765	2026-09-12 16:13:02.765	14	ac13a266-514e-4924-ac2a-04dae2e86de3
9e4ff0d2-3056-426c-a07a-be548a673c35	501	0	flat	1800	occupied	2026-09-12 16:13:39.615	2026-09-12 16:13:39.615	14	ac13a266-514e-4924-ac2a-04dae2e86de3
8dc96690-1efc-4ad7-a046-a97553f2eb0f	502	5	flat	1800	occupied	2026-09-12 16:14:03.462	2026-09-12 16:14:03.462	14	ac13a266-514e-4924-ac2a-04dae2e86de3
\.


--
-- Data for Name: helpers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.helpers (id, "societyId", name, phone, "alternatePhone", email, category, description, "photoUrl", "isActive", "addedBy", "createdAt", "updatedAt") FROM stdin;
cc508dd1-35cf-44c2-9cad-6590f20f90ee	1	Electra	9999955555	\N	\N	electrician	\N	http://localhost:3000/api/v1/uploads/7d956901f0d147b5a379a7803941c912.png	t	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-13 08:51:54.095	2026-06-13 08:52:41.02
eea999e6-eb0c-49f8-8d05-7152c05958e2	10	A	9755555852	\N	\N	electrician	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.728	2026-06-27 06:57:34.728
5573e85a-f11b-4b75-8dd1-55cfaa46a924	10	C	9755555852	\N	\N	carpenter	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.737	2026-06-27 06:57:34.737
d1f4490f-b005-473c-9db3-dae55a8d43bf	10	D	9755555852	\N	\N	ac_service	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.739	2026-06-27 06:57:34.739
21ba0eba-0eba-496a-9396-d24637129226	10	E	9755555852	\N	\N	motor_binding	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.741	2026-06-27 06:57:34.741
ab0671ed-e6d0-4ca8-b844-b64fe286ea03	10	F	9755555850	\N	\N	housekeeping	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.745	2026-06-27 06:57:34.745
374f308a-f4f2-4f0c-8481-67f404836642	10	G	9755555851	\N	\N	painting	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.748	2026-06-27 06:57:34.748
45751418-4b4b-4a73-9e4a-2db77b87d3a6	10	H	9755555852	\N	\N	pest_control	\N	\N	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.75	2026-06-27 06:57:34.75
1ccec6e6-9fc8-480d-b1bc-c53ccd0358c3	10	B	9755555852	\N	\N	plumber	\N	http://localhost:5173/api/v1/uploads/84e79798b8704cfaa561c97725fada2c.jpeg	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 06:57:34.734	2026-06-27 07:01:37.364
\.


--
-- Data for Name: income_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.income_records (id, "societyId", title, source, amount, "receivedOn", payer, notes, "recordedBy", "createdAt", "updatedAt") FROM stdin;
e897b465-6b54-4247-9409-7a1d8cb5c918	1	Milk Basket Promotion	sponsorship	1000	2026-06-05 00:00:00	Milk Basket	Canopy	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 04:30:48.059	2026-06-10 04:30:48.059
d67cde9f-289c-4371-9176-a5b4310a30ff	10	Medical Camp	advertisement	5000	2026-06-27 00:00:00	Dr Lal Pathlab		1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 09:17:58.887	2026-06-27 09:17:58.887
efefd3a4-eaba-43e6-81ca-acd044bfed46	10	Icube camp	advertisement	4520	2026-06-27 00:00:00	Nestle		1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 09:18:29.546	2026-06-27 09:18:29.546
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_items (id, "invoiceId", description, quantity, "unitPrice", amount) FROM stdin;
e58720c1-ed04-4e26-ba19-0572d3a1253a	8cef34bd-519f-4a35-bb99-c7bbe056f0fe	Test item	1	1200	1200
581f40cb-4243-48fd-aced-7acad5772ae7	ee9ec8b4-da49-4890-9520-c043076b9e37	power usage	10	12	120
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, "societyId", "invoiceNumber", status, "fromName", "fromAddress", "fromPhone", "fromEmail", "toName", "toAddress", "toPhone", "toEmail", "invoiceDate", "dueDate", subtotal, "taxRate", "taxAmount", "totalAmount", notes, "createdBy", "createdAt", "updatedAt") FROM stdin;
8cef34bd-519f-4a35-bb99-c7bbe056f0fe	1	INV-2026-001	draft	Green Valley Residential Society	123 Society Road, City - 400001	9755827797	\N	Dilip	Abc	9755827797	\N	2026-06-10 00:00:00	\N	1200	0	0	1200		4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-10 12:48:05.788	2026-06-10 12:53:45.518
ee9ec8b4-da49-4890-9520-c043076b9e37	10	INV-2026-002	sent	alpha to delta	251, Chhoti Khajrani, Near MR 9 Indore		\N	alpha	asdd		\N	2026-06-27 00:00:00	\N	120	5	6	126		1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-27 09:15:45.952	2026-06-27 09:15:59.258
\.


--
-- Data for Name: login_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.login_sessions (id, "userId", "ipAddress", "userAgent", browser, device, city, "loggedAt", "isActive") FROM stdin;
c768cbe1-002d-49c6-b1ee-f826dfcff334	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-13 10:27:20.53	t
f40165d5-9893-4405-b94e-3a294f4b2815	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-13 10:28:33.947	t
7c1e4a2d-7a9f-402c-83cf-ede7887a363b	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-13 10:29:07.39	t
81434154-de32-4a67-ad41-301a8e39ea72	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:127.0.0.1	unknown	Unknown	Desktop	\N	2026-06-13 10:31:47.163	t
c06079fb-5dfa-4259-ac07-f0e46079ac75	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:127.0.0.1	unknown	Unknown	Desktop	\N	2026-06-13 10:34:30.459	t
3e1cde22-4b6e-483a-970a-1c70984b04e4	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-14 05:01:40.602	t
e917fb43-5066-4269-befa-f1046630aab6	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-14 11:56:31.078	t
a1b5c67f-524c-438b-989a-3848f4947ba2	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-14 12:00:17.233	t
fcba4c72-f396-4c44-8851-25291cdd25ff	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-14 12:01:13.428	t
841754f8-d7a8-4adf-bd0d-447d6efd9a6d	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-15 07:11:22.18	t
0c393657-2601-49db-a974-605ae25dbc7d	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-15 12:07:39.931	t
4ba76801-a2b3-43c1-95d9-a13e25e5d5d0	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-15 12:43:21.022	t
889cb9d5-e400-4534-820e-2365f472ac41	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8457	Unknown	Desktop	\N	2026-06-15 14:25:48.334	t
b9dbb169-fc22-459d-a652-1e7e2d09d40a	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-15 14:46:22.97	t
1dbde790-de94-43f3-bcca-9b1793df277c	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-15 14:49:27.265	t
7ba781fe-f3a1-4c3f-861c-d52243b91cf8	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-15 15:11:27.082	t
8f9630ba-ee6f-44e8-84d7-57e79b0d50aa	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-16 04:30:13.847	t
26688f10-8ee9-4b87-be3c-7f7b4219f309	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-16 04:30:54.804	t
578bddba-b967-4e55-8057-5b53789ef035	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-16 09:10:44.816	t
19f66113-9e16-4905-918f-db4df44a49d6	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-16 09:11:31.965	t
1ec7c4a0-a76d-4544-ad10-a4ff616e1b9c	8ff3c9e6-876a-493e-b839-137710e85d91	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-16 09:24:58.601	t
0b74ae1b-e975-4478-80c4-da83db6e813e	866508ac-cc16-4a4d-a561-2cbae4efdb23	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-16 12:01:29.05	t
41565e44-4c20-404f-9913-6ee9745e15a9	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-17 03:48:05.252	t
87a1fceb-f91c-4699-b872-5fcd50f67c1b	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-17 05:39:03.708	t
f4e9c741-a22a-4b31-bbdb-63231926f310	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-17 12:32:09.343	t
6ef94986-b570-4cc8-b73e-06cb4f197ed1	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-17 12:40:35.134	t
6d2a63b4-53ff-4a31-afd3-cc037b00a2e1	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-18 05:03:38.996	t
eb148ced-c81b-4c18-b297-30c70e027e12	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-19 15:18:04.382	t
029e7f8e-abd1-46e9-9647-2bd7a1efb9a4	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-22 11:43:39.888	t
5872c11d-6d17-4c73-9545-125a2431d65f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0	Chrome	Desktop	\N	2026-06-24 10:33:21.811	t
26f42592-f231-45d6-9159-841c38519cf8	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-25 06:22:12.529	t
af2c730f-424b-4487-a92f-b4b97e8cd23c	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-25 14:47:49.347	t
3a76ce4a-35ae-40a9-9f7f-b96ab22a4c07	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-27 06:53:34.592	t
82044490-2552-4cec-926a-27409686d78b	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-06-28 10:25:53.722	t
39bb74f5-623c-4514-9f51-5794a8481976	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-01 09:08:37.253	t
ff81b5e0-2720-4b8f-bfa7-dc817cd3fe60	e9af40cf-60c3-4531-8a1b-1aedc66bda5a	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-01 15:56:59.181	t
4a15d409-f719-484f-9413-b392514d967f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-01 16:08:53.52	t
3e82b76b-36e8-409a-af8b-c46607759db3	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-02 07:47:23.125	t
c2943183-123f-4a84-a193-cd80e179d9fa	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-02 13:12:38.591	t
d6067e0d-9660-4713-ba10-406777342cce	5e529bb8-2137-47cf-88d4-455a57445a68	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-02 13:21:32.242	t
d55b3742-952d-4c0c-adf5-aaacfe74a986	5e529bb8-2137-47cf-88d4-455a57445a68	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-03 12:41:43.344	t
9ed9134d-e1d8-48d1-a304-803292d6acf1	2e35e707-3cd2-4639-82a1-52090cde4638	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-03 14:38:28.932	t
5c1294e5-f19a-4198-a941-cab70b6070fc	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8457	Unknown	Desktop	\N	2026-07-10 12:18:31.547	t
62edf52c-cd87-4994-9ead-266de12c274c	4a82256a-dc45-4ad9-bf5b-237025101ec8	::ffff:172.19.0.1	curl/8.19.0	Unknown	Desktop	\N	2026-07-10 12:19:29.561	t
1db45cfd-ab68-4066-b0fa-0b72c03aad11	f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-10 14:42:47.649	t
95eb0b1c-0e3f-4109-b27e-119f8b9662e5	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-10 14:45:18.806	t
d0a96c75-e75b-4e08-8f6c-fa1695316a68	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-10 15:36:08.298	t
64d7c1ef-3977-48b1-ae71-651bd628127a	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-10 15:37:30.225	t
c9e8623c-f56b-4773-8b07-04769987c27f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-10 15:44:27.416	t
b47bb300-1802-424e-8158-797396f3616b	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-11 05:11:10.186	t
dcd309c9-1867-429b-bcdb-6bb3cb54ef1a	f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-11 08:37:51.312	t
8b5db279-38eb-4a73-958b-3053d91b2c19	eadc2397-6bc4-45e3-bff7-141266f25100	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-11 09:19:10.628	t
7fff3251-4f6f-407c-a5c3-bd7c09b0dc4e	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-07-15 12:10:34.756	t
86421966-cfdf-4c5a-a4df-ebc2e38cbc56	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0	Chrome	Desktop	\N	2026-07-16 10:02:13.712	t
2f44c85f-0182-419c-843b-720a0e553907	f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	::ffff:172.19.0.4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36	Chrome	Desktop	\N	2026-09-12 16:10:32.883	t
\.


--
-- Data for Name: maintenance_bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenance_bills (id, "flatId", month, year, amount, status, "dueDate", "createdAt", "updatedAt") FROM stdin;
59309ebf-7115-4f72-96e2-f0a802b0870b	b6dcc2f1-39ee-42aa-a1c0-c04dca75fdd5	6	2026	1700	paid	2026-06-10 00:00:00	2026-06-07 07:11:22.144	2026-06-07 07:56:52.758
e406a697-6abc-439c-8107-c0a6d51bbfaa	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	6	2026	2300	paid	2026-06-10 00:00:00	2026-06-05 08:27:42.801	2026-06-05 08:27:42.869
7fc5f92c-a6b6-43bf-8c56-5575b00a2531	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	5	2026	1700	paid	2026-05-10 00:00:00	2026-06-05 08:19:55.499	2026-06-05 08:28:34.497
04c2cc12-21c9-4bef-9af3-4ad7ab94bfea	eca80f58-ad35-4a9b-8545-614cff544978	6	2026	2150	paid	2026-06-10 00:00:00	2026-06-17 10:31:30.739	2026-06-17 10:31:30.753
a6351576-9b23-44f3-b045-2a7aca32f474	dc507463-b57d-4c6e-a93f-6d3b6c4387fa	6	2026	2150	paid	2026-06-10 00:00:00	2026-06-17 10:31:39.666	2026-06-17 10:31:39.713
15cb420a-d38b-43cb-9891-7a87dcafd339	b1b3471a-bf72-45d7-a968-6f7c89623fdb	6	2026	2150	paid	2026-06-10 00:00:00	2026-06-17 10:31:44.413	2026-06-17 10:31:44.416
6404915b-5770-4441-8530-52f1696922d2	b2aebdc4-768f-4c7e-afba-ec4265704219	1	2026	2150	paid	2026-01-10 00:00:00	2026-06-17 10:32:03.812	2026-06-17 10:32:03.818
929dc0e8-9e9b-472b-8412-166ee787a77e	b2aebdc4-768f-4c7e-afba-ec4265704219	2	2026	2150	paid	2026-02-10 00:00:00	2026-06-17 10:32:03.819	2026-06-17 10:32:03.822
bebc3464-de4e-4c8c-95db-a947d97dff6b	b2aebdc4-768f-4c7e-afba-ec4265704219	3	2026	2150	paid	2026-03-10 00:00:00	2026-06-17 10:32:03.824	2026-06-17 10:32:03.826
2ec3573c-805f-4559-84a8-a12b52ca1321	b2aebdc4-768f-4c7e-afba-ec4265704219	4	2026	2150	paid	2026-04-10 00:00:00	2026-06-17 10:32:03.829	2026-06-17 10:32:03.832
2d4579d3-535c-419b-9a5c-cd6131f39053	b2aebdc4-768f-4c7e-afba-ec4265704219	5	2026	2150	paid	2026-05-10 00:00:00	2026-06-17 10:32:03.833	2026-06-17 10:32:03.835
ca2c55c0-def1-4ec8-b568-a6fc1595cfef	b2aebdc4-768f-4c7e-afba-ec4265704219	6	2026	2150	paid	2026-06-10 00:00:00	2026-06-17 10:32:03.837	2026-06-17 10:32:03.839
8c0131ff-2003-4022-9f11-e9bfe093d4f6	ae83815e-79b1-4981-bedb-ad130dd6da2e	4	2026	2150	paid	2026-06-20 00:00:00	2026-06-17 16:31:34.875	2026-06-17 16:36:01.06
eb0886b6-d4e5-42f0-b791-f0fa59c7fab2	ae83815e-79b1-4981-bedb-ad130dd6da2e	3	2026	2150	paid	2026-06-20 00:00:00	2026-06-17 16:31:34.87	2026-06-17 16:39:15.902
35c4d24f-0cea-4677-a1e6-2cd8079c5b27	ae83815e-79b1-4981-bedb-ad130dd6da2e	5	2026	2150	paid	2026-06-20 00:00:00	2026-06-17 16:31:34.877	2026-06-17 16:39:23.402
bd67e7b7-f865-4dc4-a8c9-0c2d72af2c8e	ae83815e-79b1-4981-bedb-ad130dd6da2e	6	2026	2150	paid	2026-06-20 00:00:00	2026-06-17 16:31:34.878	2026-06-17 16:39:31.558
c7fcf159-042a-42b7-831a-8aebf2cb0fef	1047cb54-daa7-4620-9184-3c09762f6432	6	2026	2150	paid	2026-06-17 00:00:00	2026-06-17 10:33:21.454	2026-06-17 16:41:02.16
7c903a8f-c3e9-4ec8-92ad-00f495e5f5e2	4dfefda6-7265-4255-ac07-41406f4ebadb	2	2026	2150	unpaid	2026-06-30 00:00:00	2026-06-18 05:30:33.323	2026-06-18 05:30:33.323
9d79b478-22b1-4e0c-b185-eda729d8d9c3	4dfefda6-7265-4255-ac07-41406f4ebadb	6	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:30:33.329	2026-06-18 05:30:36.89
c17cfd7e-68cc-4922-98de-94013bf8a37b	4dfefda6-7265-4255-ac07-41406f4ebadb	3	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:30:33.328	2026-06-18 05:30:53.296
f58cce26-e9b4-41f4-99f3-20b22a43263a	58367c1f-2066-4b50-aba3-dd11c325f0db	7	2026	500	paid	2026-07-10 00:00:00	2026-07-02 14:42:16.543	2026-07-02 14:42:24.107
951b05d7-2cef-4bc7-9478-1de0cc6a9494	eabc42d0-e574-4c3b-9680-d11f599293a1	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.398	2026-07-03 13:17:31.398
497edbc1-3222-4c8f-9f03-4bd44e40580d	397a9657-0b10-4afa-99d1-5c08f2e880c6	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.407	2026-07-03 13:17:31.407
07a8e226-21b5-4f7d-864b-a402c419683f	73923ea4-0ac6-460a-bd7d-3dbc517ae921	7	2026	2700	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.409	2026-07-03 13:17:31.409
bcc71b0f-a546-428e-b0bd-82954fb28c5d	93c69f74-387e-4309-beec-ab10f7a4bdcc	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.411	2026-07-03 13:17:31.411
9fe3d95d-2318-4c7f-ae56-b0a3f11692ef	e4ea6e31-bfbf-4552-9846-a7dce664f080	7	2026	3375	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.413	2026-07-03 13:17:31.413
bad85cb2-b99e-4032-995c-bc0a339d4c6e	b4e09c54-3c28-42a9-8d31-e10f1288f0a6	6	2026	1700	paid	2026-06-10 00:00:00	2026-06-07 07:11:22.15	2026-06-07 07:57:30.587
00b81c28-c417-409e-8628-2a2edf1ade61	ba82b741-b66f-4961-ac4b-784eb6ec91fc	6	2026	1700	unpaid	2026-08-10 00:00:00	2026-06-07 07:11:22.157	2026-06-09 06:27:48.646
661a91c6-50f3-431d-a4bb-57a1d5548438	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	6	2026	1700	paid	2026-06-10 00:00:00	2026-06-07 07:11:22.155	2026-06-07 08:36:34.588
7b2603fe-df90-40f8-9b50-17b63e923dd5	f456f9a3-7f73-4302-bf04-1bd4961de5df	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.088	2026-06-17 09:26:16.354
db6ae3fe-4a12-40fc-80b9-17193e1eaf9f	84f83e8e-42cd-488f-8e20-a968f9ed2d0c	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.14	2026-06-17 09:26:16.354
0e7705b0-1b4f-4204-9312-034c2baf2c54	f9c21cb1-41a4-435b-8e9c-58f6a450c074	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.147	2026-06-17 09:26:16.354
d933d1b8-9257-4631-8faa-0eb2989cbd85	6a97a67d-336a-4be6-9c0e-a85ac6af887b	7	2026	4500	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.414	2026-07-03 13:17:31.414
99fb9802-267c-48e7-99e2-c4d4e2345d0f	06fe8c99-4130-4ecb-a790-c7534c73413b	7	2026	5625	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.416	2026-07-03 13:17:31.416
6c1427cc-9b81-439c-ac1f-185ab2fae135	e325066b-6897-4e63-8161-ed0b345dd604	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.417	2026-07-03 13:17:31.417
4bba9d21-2133-4259-afa3-9066fe0669aa	aecd0376-22f3-431d-88c6-06413b19d186	7	2026	2700	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.418	2026-07-03 13:17:31.418
462393ee-2f5b-4198-93be-68f1f81e97c7	b7caaddc-a9e2-4d3b-a42b-0a73f4521631	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.419	2026-07-03 13:17:31.419
2176be03-491c-4303-834a-fb8fb19c3729	f3e78d72-a53d-497b-9ebc-274843d994d0	7	2026	3375	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.42	2026-07-03 13:17:31.42
eff8b292-def9-49a3-99c2-5a90bf86f148	6e7a1e8f-eff8-4420-a79d-71197fb0e578	7	2026	4500	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.423	2026-07-03 13:17:31.423
c91057f3-c995-4810-a0dc-92db761045ec	0e817c73-30ae-4fc0-b608-addeb34c9d05	7	2026	5625	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.424	2026-07-03 13:17:31.424
f7763a6a-7e4d-4be3-930c-3791f5bbe405	22d6b732-65c2-4668-a83a-52b7bac56cdf	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.427	2026-07-03 13:17:31.427
f31660a2-a05c-4309-b1f9-434e683b9829	58215653-c025-4bec-838a-0d9b3c6612ec	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.429	2026-07-03 13:17:31.429
8f1e9dba-5732-45ee-8d0b-bdeccf95f253	50d1ecd6-c35d-423c-a363-f9ddc4157e5d	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.43	2026-07-03 13:17:31.43
083ca794-d270-409e-9202-34d34bfeda27	a9197ab3-8dab-4cf8-baf9-db9f6097ebeb	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.432	2026-07-03 13:17:31.432
d1964f5f-eb17-4c66-af1d-eb31ead42b48	c0493c68-83bc-4d09-b8f0-b1c9c6ca7efd	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.433	2026-07-03 13:17:31.433
d8aaf19f-5bbd-4f22-9e18-5f9bbc707ddf	fc9bd77b-9388-48fd-8c94-57f93fa3a5db	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.435	2026-07-03 13:17:31.435
7f6f2d68-3e99-4369-9dd9-952e09ec8a47	134ce985-f64c-423b-a5e2-d8419dde5535	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.436	2026-07-03 13:17:31.436
a5810e0d-d7fb-40e9-87a6-bf0e6cf433af	9125e256-6bad-4fc6-8507-465c9a4e8280	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.437	2026-07-03 13:17:31.437
0722bcff-5ffe-4d49-9f9f-859d8c65e22c	6acab449-31dd-4aa4-b3d4-94a0e804d3ac	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.438	2026-07-03 13:17:31.438
51cc50b1-1d1f-4cf6-9cc8-a0e5684be997	b2731bf3-c10f-46a5-8a98-e16e2bb7dd82	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.443	2026-07-03 13:17:31.443
2a23ff82-cdf1-4032-9263-ec927ef3fb27	f24a6082-1a46-43af-98e0-60999ee51ec7	6	2026	3500	paid	2026-06-30 00:00:00	2026-06-11 07:48:09.38	2026-06-17 12:33:20.832
ba3db469-dbef-4337-841b-1b898a17f0f5	12af88b9-e595-48f1-a92e-56e6ead8293c	6	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.611	2026-06-17 16:21:01.771
36ddc3ff-3eca-4cd5-acc3-3b84ebe9976d	12af88b9-e595-48f1-a92e-56e6ead8293c	5	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.609	2026-06-17 16:23:03.609
97036ec8-1543-4c02-b60b-b253617fb1e9	12af88b9-e595-48f1-a92e-56e6ead8293c	4	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.607	2026-06-17 16:23:03.616
ce29a3a9-fd89-4311-a141-212ce333ad35	12af88b9-e595-48f1-a92e-56e6ead8293c	3	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.605	2026-06-17 16:23:03.621
21fad7ff-33bd-4fd3-8e6e-8e5cc22069fa	12af88b9-e595-48f1-a92e-56e6ead8293c	2	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.602	2026-06-17 16:23:03.626
3ef5c5da-ed99-4ad9-a0ca-9d802c5544dd	12af88b9-e595-48f1-a92e-56e6ead8293c	1	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 12:41:15.598	2026-06-17 16:23:03.632
b14070af-b5c7-4c1e-8f00-5db145463550	373496b3-3a54-4a72-9550-8adbc195c071	6	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 16:44:22.566	2026-06-18 05:28:23.427
4cd32cba-b4e4-451d-a251-fc4e149db755	373496b3-3a54-4a72-9550-8adbc195c071	2	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 16:44:22.563	2026-06-18 05:49:51.577
f3a0c5f8-9f8f-4d74-a105-f4304f24b93c	ba82b741-b66f-4961-ac4b-784eb6ec91fc	7	2026	1700	unpaid	2026-08-10 00:00:00	2026-06-09 06:27:48.654	2026-06-09 06:27:48.654
58837be2-9eb4-4d5f-83b4-16fca2901a8d	ba82b741-b66f-4961-ac4b-784eb6ec91fc	8	2026	1700	unpaid	2026-08-10 00:00:00	2026-06-09 06:27:48.662	2026-06-09 06:27:48.662
47157a50-a218-4f88-a73e-fc2f8658225b	c091c22c-16ad-4b77-a89d-d032859e723f	6	2026	2126	unpaid	2026-06-20 00:00:00	2026-06-11 12:32:35.218	2026-06-11 12:32:35.218
48e503d9-53fb-4b0f-9c6d-8ea032e8c2e4	72da3151-5703-429b-a6bf-e66e0381243a	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.152	2026-06-17 09:26:16.354
b908e03a-3017-44c9-b9ff-da22cb2e5109	96d05e41-e62d-47d4-a7ef-24f755c3facc	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.158	2026-06-17 09:26:16.354
ef8c203c-9be7-4ddc-8c7c-22f07e985943	5e2c2284-422d-4e74-bf3f-148c8bff85cd	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.16	2026-06-17 09:26:16.354
41451823-cbda-49fa-9c2c-5a4faa67dc22	b1c6a1e3-2880-4edf-b45e-a5a4daceae5a	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.162	2026-06-17 09:26:16.354
94584b28-0e4c-45c6-8040-cb86cfdb0e55	d65d30b4-9f62-4930-bef4-f2b7b6e79fb2	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.164	2026-06-17 09:26:16.354
5f5c7e77-3221-4d9c-a7a6-6be8b52d40e5	c89fffdb-518f-40d3-b679-48bb02af16ae	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.166	2026-06-17 09:26:16.354
66bcb817-5d1f-447d-98b4-0540070ae6cc	abe35e6a-fcea-4aa9-8fdc-c844e20a7db9	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.168	2026-06-17 09:26:16.354
fda8e88a-fcd9-4444-865c-ade58566d339	ab0a515d-8f88-43dc-aa95-6596b535c344	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.169	2026-06-17 09:26:16.354
999ea1dc-59eb-4f0d-8623-ec53988de67b	3439c2fd-b671-4a93-bc56-f2becbdd26f9	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.171	2026-06-17 09:26:16.354
52530f31-141a-429e-ae4a-04c90d6059ed	7a572cc8-3666-44ed-8774-3e90b6b7d64e	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.173	2026-06-17 09:26:16.354
c7160a79-c7a0-40d1-81a0-a50348d66c47	9b5e73aa-1cf9-4a8e-a296-4c410e50fc82	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.175	2026-06-17 09:26:16.354
f865633a-14fe-4472-aded-5b6cf8f8c7bd	db5ee5e4-1d48-4f45-a7e7-42e7d351236f	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.177	2026-06-17 09:26:16.354
f5d94c5a-1cd5-4bfa-bc63-045f2967a52e	f06df8f8-c512-46be-b72d-7e9fd4084282	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.179	2026-06-17 09:26:16.354
ff1fb9fd-0201-4a45-9469-a137e48ba9ec	5e15b1ab-ba40-46c3-b507-ab14d87fe96a	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.18	2026-06-17 09:26:16.354
0a9ba33a-be71-4bde-a0cb-bd867f882c93	6e49d205-1e35-429b-8bf2-52bc1ae8db79	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.182	2026-06-17 09:26:16.354
fc4b6c45-3825-41f8-a77e-1badc118ef34	9834942f-c8cc-49ef-9236-5fd34348c67f	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.184	2026-06-17 09:26:16.354
64e04e0f-4607-4615-9549-80b5006b0228	85ba2980-77bb-428e-9f4b-9a0518cb3362	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.186	2026-06-17 09:26:16.354
d16f2448-8af1-439f-992c-d0189cda8ed3	d10501dd-e2ae-4c1a-bebb-5561b5d4d603	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.188	2026-06-17 09:26:16.354
e55b7590-ad8d-47c3-9e0f-d1f346a6222f	f471d87e-8361-4f57-acf4-d2117dc2fc4d	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.19	2026-06-17 09:26:16.354
8fe50838-fb0d-4268-9544-7a85619e41d6	563bddba-8578-422f-a871-01363a0ad788	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.191	2026-06-17 09:26:16.354
1f5c3e17-3b96-4d8e-b211-27226fe2df0d	dd8eca31-27a0-43f8-b016-b98e6b1b9797	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.194	2026-06-17 09:26:16.354
e16556ba-9630-4c2e-bac5-8ae497052f5a	b3b922f5-d307-479d-a4f3-30fff5012784	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.195	2026-06-17 09:26:16.354
7a1331df-b007-4161-9273-18aef3bfe32b	e2be3df0-67bc-43d3-973b-1d20ea0328bc	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.197	2026-06-17 09:26:16.354
10fb3e33-a2c3-4d34-a933-b36f0e4b305c	9d192063-a483-44c6-9ec0-76da417749d9	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.199	2026-06-17 09:26:16.354
ffe306a1-a71f-4102-af25-c67eb167a337	0cf79309-cd9d-4519-96f2-c9f66134ff07	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.2	2026-06-17 09:26:16.354
4e3c6be5-e4ef-4961-a0c6-8a9de69456bd	44c89582-2af8-45d9-aea2-fc3b1893e209	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.202	2026-06-17 09:26:16.354
b92e32f8-b18a-4a98-a58d-6d2bf9f67517	128dc6f8-634c-463c-9242-0cc56af58ba7	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.203	2026-06-17 09:26:16.354
449b2845-d7a7-4f13-a973-9f152a4f3738	341b6689-aba8-4cff-a975-028bd8c5268d	6	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.037	2026-06-18 05:50:54.332
958b2b7a-a89f-435f-9539-c7401f012b0a	341b6689-aba8-4cff-a975-028bd8c5268d	3	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.03	2026-06-18 06:06:34.16
567a385a-e4be-4751-a786-cd25bbf3e007	341b6689-aba8-4cff-a975-028bd8c5268d	5	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.034	2026-06-18 06:06:41.946
dc4fc1e9-4fd9-41f0-8aff-d77cc8d5b0b6	341b6689-aba8-4cff-a975-028bd8c5268d	4	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.032	2026-06-18 06:06:41.95
e12af8e8-a0ea-4905-9534-a28f8b0a9e92	341b6689-aba8-4cff-a975-028bd8c5268d	2	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.028	2026-06-18 06:06:41.953
3477ad19-0e60-4727-939d-0dac68136603	341b6689-aba8-4cff-a975-028bd8c5268d	1	2026	2150	paid	2026-06-30 00:00:00	2026-06-18 05:50:41.026	2026-06-18 06:06:41.955
af7fa836-100d-48db-858a-63175fd3f1fb	0b98ca1a-1e0b-42ab-827a-c66388df288e	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.444	2026-07-03 13:17:31.444
24885528-aa3d-44b6-a169-caed22ddf6d6	5c310f84-c23e-4c2e-a0b2-0511bacc7027	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.445	2026-07-03 13:17:31.445
2c02f146-c13f-4a82-877d-84e4eb211c60	c781c795-c7b0-425b-843d-a793d5885ee7	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.447	2026-07-03 13:17:31.447
e620815a-dbca-4cd3-9826-fa8e9886f6b4	1341ab46-7c6f-407e-b9d4-e8b1b205a9f3	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.448	2026-07-03 13:17:31.448
b5e962f0-82f2-4c49-bb9a-9ba077d0a627	1cc450f2-f4f4-4a36-a77b-d1b7c1fe091c	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.449	2026-07-03 13:17:31.449
6bb74c66-c0da-4156-8266-c12484a87bdb	b697cacf-7aac-4c54-b847-4259c43347ac	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.45	2026-07-03 13:17:31.45
494717a3-a898-4c05-8507-d154f793e9eb	1a3c573d-8332-45d9-ad3c-b8d3d236963c	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.205	2026-06-17 09:26:16.354
9dff62ea-17c1-499f-927e-bbc8975f3bfb	f42db701-77e0-4dd0-9289-37deccacb3bb	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.207	2026-06-17 09:26:16.354
a3c3d2b0-45e6-479a-910e-b35ade628848	c74233c6-9d64-492e-ab3f-fe0728da449d	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.208	2026-06-17 09:26:16.354
820b3017-18ef-4c20-b763-bfc897c010e7	28ef4c2d-0796-440d-8bdf-5f2543a3a857	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.21	2026-06-17 09:26:16.354
036727c3-b17c-4609-836c-91cb24e37886	2deb13aa-7684-457f-9569-f55731acfe89	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.212	2026-06-17 09:26:16.354
b79d8bbd-199e-4433-b2bf-c7f874cf8cab	2fc5dd53-3834-443b-afd2-f75c3fbb9db7	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.213	2026-06-17 09:26:16.354
643f3238-35b4-4af8-9da3-4c610d707afa	87ef3547-131f-4dae-9a17-a4be3028f615	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.215	2026-06-17 09:26:16.354
f3c10961-e0f5-437b-b479-f437692930c0	b450dfb0-58ed-4d9b-9a88-f536855f236f	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.216	2026-06-17 09:26:16.354
4c9ab9c8-7f09-4236-9c61-3607bb6fbbb6	767c9e14-c67d-434d-b463-ddbe3fb8cd50	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.218	2026-06-17 09:26:16.354
32b7f877-bbeb-4e8b-b3ee-e3bde5209094	4c4d47da-393c-4b61-adbe-549a0b2ba2c6	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.219	2026-06-17 09:26:16.354
c348b5fa-07dc-4417-b57d-54781bf4935a	0122ae74-2a57-44c4-a834-22f2c62ddd64	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.221	2026-06-17 09:26:16.354
fcab1165-dac2-4caa-996b-119d5de6744f	dd926d83-1bc5-46a4-b627-8ce71a1f614c	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.222	2026-06-17 09:26:16.354
b7a99f92-e44b-46de-9274-57e249ef22e4	d7610557-98d5-4fb2-b11b-dcc439489aa4	6	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.224	2026-06-17 09:26:16.354
b87eb957-4d2c-4105-a33e-020b56fa26f2	60e0bb79-bda6-4cde-b41e-044280ba57c8	6	2026	2700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.226	2026-06-17 09:26:16.354
22a75ef9-7761-480b-a484-5e15c9e40515	144d5a44-9759-41b2-a225-e2c673316ba0	6	2026	2700	overdue	2026-06-10 00:00:00	2026-06-07 07:11:22.231	2026-06-17 09:26:16.354
5f2272f0-8376-4db6-a8be-c17edd04bed6	f456f9a3-7f73-4302-bf04-1bd4961de5df	7	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:11:10.687	2026-06-17 09:26:16.354
b07a085b-22ca-45c8-b11f-b5532e384a8f	f456f9a3-7f73-4302-bf04-1bd4961de5df	5	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:11:10.687	2026-06-17 09:26:16.354
d7b1c49e-b003-4dee-ac27-3ee5a50c1503	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	1	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:20:13.482	2026-06-17 09:26:16.354
faf9eb64-986f-4e20-b2dc-df399c7d7876	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	2	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:20:13.492	2026-06-17 09:26:16.354
5a88fe6a-54b2-4cea-acfc-b825026e548c	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	3	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:20:13.497	2026-06-17 09:26:16.354
18baffae-068b-421c-9abd-6f581e6bc159	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	4	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:20:13.501	2026-06-17 09:26:16.354
7f041804-81c2-46f4-b09c-1abeb215a0e1	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	5	2026	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:20:13.505	2026-06-17 09:26:16.354
e6217c2d-0e00-4b31-aab3-dffc99d3020d	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	1	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.737	2026-06-17 09:26:16.354
920e134f-0560-46cd-a4c2-79ae557a2646	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	2	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.742	2026-06-17 09:26:16.354
a70ba4b4-e490-4853-980f-8789ccce82bc	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	3	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.744	2026-06-17 09:26:16.354
a6fc8c2d-fdb2-45b0-9287-30fcecface2c	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	4	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.747	2026-06-17 09:26:16.354
8a8f679f-aaaf-4e89-b930-2f4ade012b2d	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	5	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.75	2026-06-17 09:26:16.354
fa13a62c-f4bf-46f0-8dd3-5be2f6750f32	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	6	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.752	2026-06-17 09:26:16.354
c7a13633-4108-4a52-ac4e-87fd5a35845c	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	7	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.755	2026-06-17 09:26:16.354
981b1063-1569-41ff-b665-4e8435ad1754	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	8	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.758	2026-06-17 09:26:16.354
6df7a911-b2c2-4854-b237-4158b04765cb	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	9	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.761	2026-06-17 09:26:16.354
620d7db5-194f-460e-ba29-af70495e340f	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	10	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.763	2026-06-17 09:26:16.354
9d4bb2ed-7507-4105-a731-ca6338474aed	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	11	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.767	2026-06-17 09:26:16.354
9085e9ae-b67e-45bd-97a7-fa8f69b07ccc	3f9f4e18-8189-4c7e-9e76-70c8b22117ce	12	2024	1700	overdue	2026-06-10 00:00:00	2026-06-07 08:33:17.77	2026-06-17 09:26:16.354
ab0f6d70-fdf1-4441-af1b-2bdecd4c3447	888235fa-c2b9-4f02-86bd-168bced9144a	4	2026	2150	unpaid	2026-06-30 00:00:00	2026-06-17 16:23:19.95	2026-06-17 16:23:19.95
accdf998-30b5-448c-80f0-a8bd9bf89b8f	888235fa-c2b9-4f02-86bd-168bced9144a	6	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 16:23:19.952	2026-06-17 16:29:22.543
7dd6d5c8-d721-486d-8199-ef0eb8bbc8c7	888235fa-c2b9-4f02-86bd-168bced9144a	3	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 16:23:19.949	2026-06-17 16:33:08.361
87d30c72-b08d-4ac9-a5c7-55f24cf2eb6e	888235fa-c2b9-4f02-86bd-168bced9144a	2	2026	2150	paid	2026-06-30 00:00:00	2026-06-17 16:23:19.94	2026-06-17 16:33:42.582
14f0f5b0-c2ed-4264-be15-edcd6c4d4bd4	fbfe39bb-f017-43c3-bb65-df0d5790d716	1	2026	2150	unpaid	2026-06-30 00:00:00	2026-06-18 06:15:27.301	2026-06-18 06:15:27.301
4c636c88-d257-45ef-a469-bbf6d6b088fb	fbfe39bb-f017-43c3-bb65-df0d5790d716	2	2026	2150	unpaid	2026-06-30 00:00:00	2026-06-18 06:15:27.303	2026-06-18 06:15:27.303
d31a9ce3-254d-4e11-8e72-85ec7246cc8f	fbfe39bb-f017-43c3-bb65-df0d5790d716	6	2026	2150	unpaid	2026-06-30 00:00:00	2026-06-18 06:15:27.305	2026-06-18 06:15:27.305
cba9fc97-5f09-4cb7-be3a-95a36331b1f3	8dd6482b-44c8-4932-9387-0d9c759a0fa2	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.452	2026-07-03 13:17:31.452
5cd0b2a3-aa4a-4b6a-a971-2212a4876bb6	ccf3e5b1-b05b-42e8-807a-aa697c9beab8	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.453	2026-07-03 13:17:31.453
1ed72f11-1565-4caf-810d-a11f57ab7ec5	71d7efbf-5dc6-44dc-a7b4-8d4c4e1a612a	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.455	2026-07-03 13:17:31.455
050faab8-cbd8-40ff-b2b0-72e5554da5c6	94c471a4-8548-4f56-a18c-aa9df1de893e	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.457	2026-07-03 13:17:31.457
9e31859d-7c02-4e80-a24b-5c44395b9482	36451262-4117-4d12-84b3-5c16b9cebc27	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.458	2026-07-03 13:17:31.458
fbdd20ac-c47a-4b90-b342-88b89a6d57c0	2db48490-f13d-4cdb-b762-bf3b191fe490	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.459	2026-07-03 13:17:31.459
0785cd6c-68d4-440f-a9fa-a1267d8c1004	2d28cf72-41dc-4382-aea9-c452474ad64e	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.46	2026-07-03 13:17:31.46
d76d5ece-5d33-4199-a2e6-42133cac8648	c21d098a-22ea-4234-b38f-8f3c91384f48	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.462	2026-07-03 13:17:31.462
91ac0b4e-00e2-468e-b843-aca6b1e7c8a6	45985f42-bc1f-47ae-be3f-6e98096311e2	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.464	2026-07-03 13:17:31.464
67b30735-4ab5-40ad-9690-4fc799e1c776	839749a1-6f4a-46b1-a406-1029274bb2cf	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.465	2026-07-03 13:17:31.465
af79a24d-300a-4720-a3b3-b30b6349db9c	1c558af1-b2e7-45f8-a34a-16bd94d7c355	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.466	2026-07-03 13:17:31.466
1d1b8b2d-1e2b-4891-ae7f-c5b360330a37	3a4d9dc9-6dc2-4cfc-9e13-8132177b0e4c	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.468	2026-07-03 13:17:31.468
edd5d50a-2380-4194-ac4c-234b0623fa52	50ec56ee-db4e-4e51-9f83-511455c048b9	7	2026	2700	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.47	2026-07-03 13:17:31.47
a21dc183-bbff-4a01-bd33-e739ad474a3d	78d348ea-a21c-4a8c-b45e-f8fb9976664a	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.471	2026-07-03 13:17:31.471
29569d45-c297-4f86-ba58-952176bd6f37	d4135690-4156-4f79-93f3-df4e567b3394	7	2026	3375	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.473	2026-07-03 13:17:31.473
1d1fc05b-78ce-40da-b9c0-4ad5ed121796	10c6adb3-5fc1-4fc2-9781-9ad9c5d744b9	7	2026	4500	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.474	2026-07-03 13:17:31.474
9b5b33a0-cb81-42aa-bf80-6d63df7e0f3a	f9db41c7-4066-4051-b020-12eb07784171	7	2026	5625	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.476	2026-07-03 13:17:31.476
21797a3f-e12a-4a3e-8ebf-d7dc86d1ed57	adf6b3e7-6c2a-4fab-bdd3-560261a55ac1	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.478	2026-07-03 13:17:31.478
59864d82-8111-4aa5-a2ea-7ff0eb38ba9d	b8e5179d-85ba-4a55-83f1-34673700ab26	7	2026	2700	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.479	2026-07-03 13:17:31.479
f4112a4b-4a27-452e-a01b-ac804536f6e6	615a779f-3b2f-4fdf-b1e5-2d29273a17ee	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.48	2026-07-03 13:17:31.48
4ec61df1-78dc-4c4f-8df0-6934552b9d9a	3a664fee-4d12-45a9-84ab-cb0f43109343	7	2026	3375	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.481	2026-07-03 13:17:31.481
90581447-02d5-471a-b34e-215457c925cf	ba6c2e3c-74ef-4634-8b14-799fab5e592e	7	2026	4500	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.483	2026-07-03 13:17:31.483
a7fc7c9a-c944-41dc-b5e4-c3a5e7c4fe4a	77b90802-5931-4a59-bf56-ca235e8d9dc9	7	2026	5625	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.484	2026-07-03 13:17:31.484
e25e769d-cba5-424a-8b6a-a279e9ef9925	9c9313cd-1936-4537-bcbe-cd8ea37f294c	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.485	2026-07-03 13:17:31.485
46fb9d61-32a9-4a6f-9f39-619dfe0cb1de	31d042e3-b611-4cf7-8818-2a232d43a37b	7	2026	3375	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.486	2026-07-03 13:17:31.486
0d9bd847-0d61-4e3a-b95d-e7cff4ea1d9e	167da63b-204a-4cd3-90e9-0ad57878a882	7	2026	4500	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.488	2026-07-03 13:17:31.488
260e1ec8-4884-4cac-a4ea-9195d531f268	d9f447e8-7571-4082-8efb-aac810b2c216	7	2026	5625	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.489	2026-07-03 13:17:31.489
c109f003-853a-4b1d-8998-477a394805a8	a5af25e8-39ed-4cc7-aa1c-e17ac926dc8d	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.491	2026-07-03 13:17:31.491
fdfd18e0-d2df-44a4-bf2a-e8b945143268	773bd0bb-f52a-4561-98ad-cd040ecbd694	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.492	2026-07-03 13:17:31.492
416b1d3d-e74c-46ef-abe1-5ba701e23818	ee031c91-748a-425c-86b6-591352a460ca	7	2026	2700	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.493	2026-07-03 13:17:31.493
f86fc4a2-5aba-4eeb-9fd3-2b6c8696ee22	79e2f043-4198-4714-9f23-2739aeef96cb	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.495	2026-07-03 13:17:31.495
c383f468-6b27-441c-af45-7fb0fa1e3056	c968a093-2335-4021-b46b-83b3ff259092	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.497	2026-07-03 13:17:31.497
fd61b23e-f9d0-4ca3-b34b-1462d1569035	c5c32892-6cc2-4d91-b700-69e72cacca0a	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.498	2026-07-03 13:17:31.498
def00f62-f962-4bf9-bfd4-f78760e6ade1	eb8b5263-f0d6-4078-ab29-13ef3f0e4d19	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.499	2026-07-03 13:17:31.499
85737323-1f30-4584-ac15-c7315db5122f	295d28cf-1700-45fd-be32-d08bc76f802f	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.5	2026-07-03 13:17:31.5
2b4526a3-0109-4609-8c19-8932bacc6295	3209c85b-674f-4c09-ae62-2e8f85a0d7a7	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.502	2026-07-03 13:17:31.502
6d6bd9d3-3603-4285-b930-c4f92c85f4aa	be76b827-1cae-4e42-993a-be5e009bb098	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.503	2026-07-03 13:17:31.503
f40aa955-be48-4a2a-b3ab-6e828fbf1e39	21bedbf1-183e-455c-8d02-688afe94e192	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.505	2026-07-03 13:17:31.505
e4cbcc6e-65d7-443d-b927-a558240e5a64	dac28408-01de-4fd2-85f0-49e03b506c12	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.507	2026-07-03 13:17:31.507
8deac6ce-ae18-4833-a1c8-a7b0d7cffecc	7dca1382-40fc-4273-b715-ee17849c1407	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.509	2026-07-03 13:17:31.509
5af0b14a-ba03-419c-af6b-7f30b6628f36	14a81fe0-7e65-434c-b41a-3191f085ad86	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.51	2026-07-03 13:17:31.51
4ae5a2fe-db30-48a3-8967-3864afd6fa19	f3843f85-917b-475d-b51c-31f0877ed8ff	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.512	2026-07-03 13:17:31.512
9a7531d4-0e8a-4467-a4db-c6f7324d9a6e	783b71dd-fc28-4671-8313-209f02919a46	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.513	2026-07-03 13:17:31.513
a8c0e892-f5cc-4fdb-a886-2fc17ab7a965	e56f88f7-ae5b-49ff-8cf8-e383b70fb9c9	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.515	2026-07-03 13:17:31.515
88586bdc-6c59-4ef3-9fc2-423490b4101f	55a280c8-037e-4f6f-bbd1-e6fd44cb5120	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.516	2026-07-03 13:17:31.516
23a5f640-d084-499b-8947-33c662ca9505	3a9d7e72-c992-46ce-bfb0-962ea1f02e13	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.517	2026-07-03 13:17:31.517
bbb4a3c3-c35a-490c-867f-9831ace0d030	684e6f88-20b0-478a-887c-3059ad52189b	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.518	2026-07-03 13:17:31.518
33076916-e1a9-4d84-9330-56b3c1fc11ad	67591685-8002-4806-9d19-f602f856e143	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.52	2026-07-03 13:17:31.52
1a9076f2-c6ee-4153-b9f0-3dc2c9cb07b8	091e0ffa-a9e6-45ae-b981-17a1d38d13f6	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.522	2026-07-03 13:17:31.522
60ea0bef-676b-4702-bd3b-e4a836690b1f	5d009904-d998-448f-a525-6aef713d9748	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.523	2026-07-03 13:17:31.523
b9f47a15-0e1f-442a-9fd9-659bd1e3f0ac	975bfc40-4584-49b2-a83d-a6ee907534cc	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.524	2026-07-03 13:17:31.524
1d0731e7-c037-47ba-a92b-b9c0c543e3c8	dcf0b2c9-203f-4b69-aad1-fa90d93d7c75	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.526	2026-07-03 13:17:31.526
cf8635a8-64ba-472d-8a24-968f5229979e	3451acad-8727-4ac2-ae72-444e61e77118	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.527	2026-07-03 13:17:31.527
a8f7c953-8f39-49e5-bb7f-998482d7cd0a	416d2f3a-e58e-4c63-a5fa-035823c87f2e	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.529	2026-07-03 13:17:31.529
1b6b3498-ea75-4578-9603-1e8324dcd3f0	acacb9cb-359f-4879-a8c8-063cf165ec77	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.53	2026-07-03 13:17:31.53
74fc5dbe-87cc-4093-b6c9-b5b348f5cf46	c22c17f5-73ac-4c60-bf0a-fe9bf6fc6b04	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.532	2026-07-03 13:17:31.532
01ea1823-19fe-4ba5-b767-6a11db20840e	060a5985-8591-4879-9161-4d019f6a3ab1	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.533	2026-07-03 13:17:31.533
66004fb6-f968-4839-9f7f-6b816ed24e19	c11db0f7-2963-411f-8231-62060a62fb92	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.534	2026-07-03 13:17:31.534
7d5bfb26-49ee-48f7-a619-af5b06c8c1b7	f92b5748-42a0-4ace-8ea1-c3e9f858b2d1	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.535	2026-07-03 13:17:31.535
fad5c419-1013-4620-b298-7b3f98e41411	07f9e198-7645-46ce-bfc0-5c5e0ff77dec	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.537	2026-07-03 13:17:31.537
1028b906-0429-4a37-b3c9-ed9c409ff432	bb03cf93-7122-45b8-8da9-afd0265b4b7f	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.54	2026-07-03 13:17:31.54
2533e96f-773e-43d7-9620-12ebe0c397a0	de899136-7066-4ed0-b745-fa713f12456d	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.543	2026-07-03 13:17:31.543
527421e8-2fdd-4fa2-bdb7-4aa5e1e2dc21	ae3ef16a-51c9-4703-bd69-829d8cf92eb3	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.544	2026-07-03 13:17:31.544
1c81ec3d-3e2f-4e6c-a49f-7905bfd56d0d	e8dd5447-e8d3-4e88-98b5-9a6bddd0a06a	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.545	2026-07-03 13:17:31.545
d42c73d9-a34d-43a9-920c-476bcec391fb	d71e8e40-b325-42c2-a37e-8b123578743a	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.546	2026-07-03 13:17:31.546
78524ddc-113a-4eb0-9956-64a17225e22e	93719735-ad2b-424b-9cb8-5b7d29e9df1a	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.548	2026-07-03 13:17:31.548
caee3fde-178a-4b62-8865-eea0237590c8	d3b0c60c-35c3-4e62-b511-6edcad3be9c8	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.549	2026-07-03 13:17:31.549
6581546e-d9e6-44dd-8c73-1de990f565e2	ccef5571-4974-4136-87f7-e9a4b969f33c	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.55	2026-07-03 13:17:31.55
df52c2d1-ffc8-4c96-a932-e034d6e3f04c	e0c2014a-99b4-40d6-847d-15a723a17ee8	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.551	2026-07-03 13:17:31.551
348087dc-6f0e-4cf7-ac69-b09353f714f2	03625b67-e6b3-4d54-8c20-93970a91e485	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.553	2026-07-03 13:17:31.553
8fe552a7-2d3a-4dc8-aa3c-cd84f35271f5	b736a4b4-c916-40c3-aab6-57b577922d27	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.554	2026-07-03 13:17:31.554
7f6ff70b-43b2-4684-b1ca-a3af09e5b194	85ac5b04-ee02-41ee-a1ec-0ca363468866	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.555	2026-07-03 13:17:31.555
a0da2b90-2557-41b4-abcf-6c147968884f	c4078200-8cb4-471a-8257-a98f7a43cdb1	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.557	2026-07-03 13:17:31.557
dec5f06b-cbd3-40ae-9536-9436e4583348	8c5b7b7f-bb25-4be6-9aa1-0d1726018236	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.558	2026-07-03 13:17:31.558
bbf60061-9dfc-4f5a-9873-113f7b6eccfa	e3f40e01-9f23-4c59-92e1-dbc746702b32	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.559	2026-07-03 13:17:31.559
39fef2ff-847d-48cd-81f2-7caf61d395c0	b63a9500-68c5-49fd-8ae9-9e8d190dc650	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.56	2026-07-03 13:17:31.56
fcddf3e8-9b97-497f-a973-e333563ca0cf	e9408249-4b89-4604-a245-99d03f4e5c22	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.561	2026-07-03 13:17:31.561
67c2d19c-abc3-44cf-8708-4738aa638ca7	07f466b5-2439-4137-bd1a-3beff11ff6da	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.562	2026-07-03 13:17:31.562
3912ab9e-acd0-4ec0-99a1-4f3c5aec4b2b	050cf58c-6bf3-4654-8ce5-96424690c617	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.563	2026-07-03 13:17:31.563
f1d5e269-e530-47f0-997c-acdada977ec9	7deff147-8ae3-4602-9395-3598923df190	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.565	2026-07-03 13:17:31.565
211799ab-99f7-472f-91c0-f6bb4a7526ba	c375af80-892f-4f5a-aede-f9972d32bb95	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.566	2026-07-03 13:17:31.566
3ee06a5e-9d1f-4e42-a1fd-4dc5fd75964f	0474c2be-e414-4a0d-81b6-4181fd55c27d	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.568	2026-07-03 13:17:31.568
9ce6b675-3cbe-4837-8d3c-b5ad381c6131	b086787f-410f-4ce2-b508-db5a4a8cd1bf	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.569	2026-07-03 13:17:31.569
ca0520d3-7ce7-4f55-afb4-a0d541ee840b	3d75f7f0-98ed-4db3-b2dc-763eaf6cb262	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.57	2026-07-03 13:17:31.57
821295e1-fb6e-47c8-8b17-90248b588783	6efec2a2-d302-481d-98d9-8510e0d3c8f9	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.572	2026-07-03 13:17:31.572
3eb4bf08-f50a-42c7-ad7b-6f78ff2559bf	32c46f11-5ccc-4409-9dc6-a684a240a49b	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.573	2026-07-03 13:17:31.573
72ebdc18-11a2-444c-8560-34be5faac660	138828af-e053-40da-8ef9-516585732357	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.574	2026-07-03 13:17:31.574
b437afd8-f1d4-4169-8a68-f466041f677e	c4695bb0-0e70-4a4b-a8c3-7c4118319b01	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.575	2026-07-03 13:17:31.575
0afa5be0-fe33-4df4-9b00-7a31c3a93995	77f55918-aa60-47b3-b989-49026574f9bf	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.576	2026-07-03 13:17:31.576
2d555f3b-b2c9-4d47-9a2c-b41bacee3406	3e62c1d2-6958-4f94-b83f-8ef468c9f969	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.578	2026-07-03 13:17:31.578
96452271-8f73-4668-853a-cf0f20d82ba0	79fce540-20bb-42a2-91e6-287ab026c669	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.579	2026-07-03 13:17:31.579
c60b1038-6962-42d0-b176-4e8def0ed936	4964a392-db3b-4453-8d8d-39a3394ef814	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.58	2026-07-03 13:17:31.58
287c1aa2-2532-4555-98a6-3c78b18bfedb	fc24ebac-d6a4-4779-88bc-dd55a46e93d6	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.581	2026-07-03 13:17:31.581
0c6dfd3e-de2d-47a2-b140-02027c466c38	81adc3fd-a3e7-4d4f-96ef-87a80bd0af27	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.582	2026-07-03 13:17:31.582
f823a33b-ce82-4995-9a32-e80f3116d732	edb88c52-d244-44e8-8acb-531742bc08cb	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.584	2026-07-03 13:17:31.584
5c413849-4f60-4855-b294-49a62485b089	87b69f77-2c3a-4b3a-8dbc-304000bc3ca4	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.585	2026-07-03 13:17:31.585
12e20575-602b-4189-9168-e519ff240e9c	58ec8846-096c-45a9-90a1-08387f820ecb	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.586	2026-07-03 13:17:31.586
5ce1fb25-e0a2-48e6-b22e-ad93f7d5e856	2279692f-a6ad-416b-8ba8-2691d6264675	7	2026	2250	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.587	2026-07-03 13:17:31.587
47c4628e-9f7b-41ba-9364-a78c60fa1a29	574888af-4edb-4ec0-a571-d50afb35a245	7	2026	2812.5	unpaid	2026-07-10 00:00:00	2026-07-03 13:17:31.588	2026-07-03 13:17:31.588
b4b546c4-8c01-4533-aedc-d2c9c43e5ed6	015c39fc-d102-4a90-b1e8-668f555c4aa7	7	2026	2250	paid	2026-07-10 00:00:00	2026-07-03 13:17:31.426	2026-07-03 13:17:55.132
89550bf3-044b-4900-aaa9-758898b3cac7	0271539f-8a09-4bc5-8954-628415ed3971	7	2026	2250	paid	2026-07-10 00:00:00	2026-07-03 13:17:31.494	2026-07-03 13:18:12.584
501fcfad-fbc5-4da1-81e1-74a4258a2eee	1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	7	2026	500	paid	2026-07-10 00:00:00	2026-07-03 15:16:18.2	2026-07-03 15:16:18.205
6b2151b4-57f1-4a65-926f-74175be6ca19	1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	8	2026	500	paid	2026-08-10 00:00:00	2026-07-03 15:16:35.031	2026-07-03 15:16:35.037
e54ecaa9-c4e3-4c4c-8dc0-1684c3fce50a	1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	9	2026	500	paid	2026-09-10 00:00:00	2026-07-03 15:16:35.042	2026-07-03 15:16:35.045
28862a6b-f3df-4bff-827f-5eb5073647f3	1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	10	2026	500	paid	2026-10-10 00:00:00	2026-07-03 15:16:35.049	2026-07-03 15:16:35.052
0e523af0-e86c-4206-84cd-baef28bf5402	0fcf4029-601b-4966-9d33-88623775fd38	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.495	2026-07-03 15:16:52.495
49129e08-f887-47e5-bfb6-736a3b6e3705	578871c5-0ff0-4027-a537-138184049557	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.5	2026-07-03 15:16:52.5
09e49b21-31b5-4843-b8fe-38156f1d90bc	65edb33b-17c8-4771-9e62-2f4689bea775	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.503	2026-07-03 15:16:52.503
b36ba325-cc25-47ce-93bd-87d55a10a44e	96e6b65b-d3c9-4d30-b3c2-c745f75e34a7	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.505	2026-07-03 15:16:52.505
14d50d29-678d-45d2-aad6-c65083b97273	0b0b8ca1-7c84-40ba-90d9-0837f83ad032	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.508	2026-07-03 15:16:52.508
806a4b90-ef82-4c10-bf1e-3f086cdb7a73	f37e5c20-e834-4aa7-be9e-a8fbdf94e8b5	7	2026	500	unpaid	2026-07-10 00:00:00	2026-07-03 15:16:52.51	2026-07-03 15:16:52.51
3c7a5f0a-2afa-49f5-b926-541f21f23d3e	c9d0d974-2af0-4c2b-9e06-3cc9eeba3dce	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.253	2026-07-16 13:37:57.253
3fabcbb2-b088-445b-a2da-476ffa853248	f8f2df4f-32c0-4955-b1ae-207a2f7effd3	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.259	2026-07-16 13:37:57.259
0caf3e9d-6aef-49fb-a1d1-eb35f9ba3b36	373496b3-3a54-4a72-9550-8adbc195c071	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.261	2026-07-16 13:37:57.261
3c14c3bd-6906-473a-a658-855f58e26fa1	c458286b-de7b-42f6-bb3f-d7e533c617da	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.264	2026-07-16 13:37:57.264
1514e0e9-c1f5-4427-a561-58fe05d49ced	357a39dc-fe97-4b1c-aa3d-2638d561f109	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.268	2026-07-16 13:37:57.268
93443b9f-5e4a-4237-9574-8f51394d2359	fbfe39bb-f017-43c3-bb65-df0d5790d716	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.27	2026-07-16 13:37:57.27
ef332ecb-3d7d-4cd0-92ca-a3c5c4a2ee0d	4dfefda6-7265-4255-ac07-41406f4ebadb	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.271	2026-07-16 13:37:57.271
91a2a9b8-fc69-4b72-8f06-aad5da9a0471	341b6689-aba8-4cff-a975-028bd8c5268d	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.274	2026-07-16 13:37:57.274
5e73b154-f01b-46e9-9096-89ac460d4894	1047cb54-daa7-4620-9184-3c09762f6432	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.275	2026-07-16 13:37:57.275
36ef76c1-9519-43a5-bce6-1301d95b8fe3	12af88b9-e595-48f1-a92e-56e6ead8293c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.278	2026-07-16 13:37:57.278
c61ebd5e-cce6-4814-87dd-761e04f3c3ef	888235fa-c2b9-4f02-86bd-168bced9144a	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.279	2026-07-16 13:37:57.279
315c6116-895b-4afc-9865-c5921456fd1c	ae83815e-79b1-4981-bedb-ad130dd6da2e	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.282	2026-07-16 13:37:57.282
1b5cd51f-a1a9-4c75-b568-b48b9c1ec885	eca80f58-ad35-4a9b-8545-614cff544978	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.284	2026-07-16 13:37:57.284
ae95a0dd-2b87-4f59-9d43-d08ddcf7af46	dc507463-b57d-4c6e-a93f-6d3b6c4387fa	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.286	2026-07-16 13:37:57.286
840776d6-5df0-4a1c-ad82-18fa03153ff8	b1b3471a-bf72-45d7-a968-6f7c89623fdb	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.287	2026-07-16 13:37:57.287
33aa8706-ae0d-40fa-ac56-2afa640764ab	b2aebdc4-768f-4c7e-afba-ec4265704219	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.289	2026-07-16 13:37:57.289
eb57187f-f441-4f58-8bcb-a9af971bfbcd	7624767d-e6d5-4852-bc30-d4caaf34d9bf	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.291	2026-07-16 13:37:57.291
cafbdde7-4024-4033-9134-ffb31d58bfeb	535ac6e5-785f-4b06-a211-234ad24933e8	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.293	2026-07-16 13:37:57.293
934eca36-0ef9-4ae5-a389-1a8c11cf6f8e	8fbfd074-3d88-4d4b-8bee-f5f2248ffa96	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.295	2026-07-16 13:37:57.295
46d48fac-13b3-44be-a0fe-94c3f582f51f	9e7ff0ac-73af-4b37-875d-1613d50e016d	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.298	2026-07-16 13:37:57.298
92f390d8-a720-411b-b2d7-86b6838bedea	547b2484-0fdb-41c2-a7b9-15f9c1d2f60c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.3	2026-07-16 13:37:57.3
3836b7d1-9808-4a50-be5b-0f6ba76ed1b8	2a0d660d-7b11-4609-a9cf-69e8c7fa3a9c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.302	2026-07-16 13:37:57.302
b2de4f3e-4417-44d0-9cff-515c6fd72c30	f3208cd4-de1b-4f2c-b6ac-55c8a9e1f61c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.304	2026-07-16 13:37:57.304
de8a0b75-9cb8-4b2d-86e5-ce2cc17d9bfe	ffb5e0b9-018e-4ed7-ad12-d630186897c3	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.305	2026-07-16 13:37:57.305
62771423-2e9f-42e0-b9b5-b9c8f3bd3728	0a10081f-ecfb-473c-b2fc-0ff5179db286	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.307	2026-07-16 13:37:57.307
afc52a69-a205-4f25-bdf4-b6c76828f42b	1816e1d9-ed07-491e-b26d-6b6140673828	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.309	2026-07-16 13:37:57.309
96021790-4b11-44bf-97a5-7d58910f173a	f3054395-7961-4976-a271-4dcb3157d712	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.311	2026-07-16 13:37:57.311
59c4b8bb-8aec-47d9-a2c5-ff637f09e88d	8bdedff6-b310-44a8-ade4-0ef532ac606b	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.312	2026-07-16 13:37:57.312
d7b7be41-213d-4973-8526-5faf978e4c85	8af81482-14f3-42f8-a623-7ac9da9762f7	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.314	2026-07-16 13:37:57.314
cc3f5bc6-2c81-462d-8238-be4fc6e6fe47	3517b4f7-632f-4745-92e6-2adc2651ebcf	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.316	2026-07-16 13:37:57.316
6d169301-010e-434b-873e-c79b36e20dcc	61858c41-43fa-4c5e-b76f-635efa41e78c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.318	2026-07-16 13:37:57.318
c29dee96-ce29-4ce7-8fd3-975056ca16c4	f3e061f8-20d2-465a-a6f4-cbf221ad8a18	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.319	2026-07-16 13:37:57.319
a5f83d93-0716-4d1f-b5d2-595fef238341	c86fa7f5-6407-41af-b38a-7147cb29a796	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.321	2026-07-16 13:37:57.321
8b04fca5-81e8-41bf-9e41-a2ce02afc265	88ed44c2-f060-45a1-9063-df3696146d5d	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.323	2026-07-16 13:37:57.323
2c0a4bdb-ff63-4f7b-a009-a58ddc5af3cd	47fe1587-7b29-47d9-ab28-80306fc38cd4	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.326	2026-07-16 13:37:57.326
8e18108c-e3d4-4242-82f0-bbfcc9abe157	031546ee-e650-4153-8f4c-1fc7f14d9e6c	7	2026	2000	unpaid	2026-07-10 00:00:00	2026-07-16 13:37:57.328	2026-07-16 13:37:57.328
\.


--
-- Data for Name: notices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notices (id, title, body, priority, "postedBy", "postedOn", "expiresOn", "createdAt", "updatedAt", "societyId") FROM stdin;
6224613a-6325-4a39-bf46-8770cf64eb7b	Tank Cleaning	Tank cleaning is scheduled this sunday, keep the backup water as per your need.	normal	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-03 13:27:23.538	2026-06-08 00:00:00	2026-06-03 13:27:23.538	2026-06-03 13:27:23.538	1
3d588361-f9eb-4d19-86a5-452ed5c4734c	Water Supply Shutdown	Water supply will be off on 7 June from 9am to 5pm for tank cleaning.	high	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-05 08:19:55.572	\N	2026-06-05 08:19:55.572	2026-06-05 08:19:55.572	1
87ed10cf-4923-4946-97c8-da13cf919745	Water Supply Shutdown	Water supply will be off on 7 June from 9am to 5pm for tank cleaning.	high	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-05 08:27:42.887	\N	2026-06-05 08:27:42.887	2026-06-05 08:27:42.887	1
c7a211a6-2f29-4e1d-a519-ceca31ea4e29	Water Supply Shutdown	Water supply will be off on 7 June from 9am to 5pm for tank cleaning.	high	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-05 08:28:34.517	\N	2026-06-05 08:28:34.517	2026-06-05 08:28:34.517	1
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", "flatId", message, "isRead", "createdAt", "updatedAt") FROM stdin;
b2ae35b1-ce91-4b4c-9f2e-efbb42973eb1	62678121-1626-4637-89c3-54153e164523	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Visitor "Amit Sharma" has arrived at your flat (F1-01). Purpose: Delivery	f	2026-06-05 08:19:55.738	2026-06-05 08:19:55.738
3a3a58c2-cba4-434a-8e4d-2d894427b57a	62678121-1626-4637-89c3-54153e164523	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Visitor "Amit Sharma" has arrived at your flat (F1-01). Purpose: Delivery	f	2026-06-05 08:27:42.993	2026-06-05 08:27:42.993
d67a94bb-12b2-4389-b6ef-56641469b98d	62678121-1626-4637-89c3-54153e164523	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Visitor "Amit Sharma" has arrived at your flat (F1-01). Purpose: Delivery	f	2026-06-05 08:28:34.637	2026-06-05 08:28:34.637
\.


--
-- Data for Name: onboarding_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_sessions (id, "societyId", "currentStep", "step1Data", "step2Data", "step3Data", "completedAt", "createdAt", "updatedAt") FROM stdin;
62f72f1f-fff8-4954-84eb-641c82d3a42b	2	1	\N	\N	\N	\N	2026-06-15 14:24:57.155	2026-06-15 14:24:57.155
6338844d-98d9-4e42-a4e5-eba393b002be	3	1	\N	\N	\N	\N	2026-06-15 14:25:05.794	2026-06-15 14:25:05.794
0aa9e26c-06ae-4f31-bc3f-1d3087b30a9b	15	7	{"city": "Bbhopal", "name": "Adams Park Bhopal", "state": "Madhya Pradesh", "address": "200, Pink City near Ring road", "pincode": "452220", "contactEmail": "adams@mailinator.com", "contactPhone": "9755827797"}	{"username": "adams_admin"}	{"fixedCharge": 500, "ratePerSqft": 1.5, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	2026-07-11 09:18:23.75	2026-07-11 09:16:44.206	2026-07-11 09:18:23.75
4ee64309-e85c-44ef-8da9-1fe3d3cd2f4f	5	1	\N	\N	\N	\N	2026-06-15 15:05:29.647	2026-06-15 15:05:29.647
455cf376-7a26-4603-8493-1f6db6f2fea5	6	1	\N	\N	\N	\N	2026-06-15 15:06:33.451	2026-06-15 15:06:33.451
10b3fd59-523a-44a1-a595-a158d3c6b312	7	1	\N	\N	\N	\N	2026-06-15 15:08:19.546	2026-06-15 15:08:19.546
42c400a3-0f64-4c85-8935-082fd6b52fe8	4	4	{"city": "Indore", "name": "Gautam Residency", "state": "Madhya Pradesh", "address": "251, Chhoti Khajrani, Near MR 9 Indore", "pincode": "452011", "contactEmail": "admin.gr@mailinator.com", "contactPhone": "9755827797", "registrationNumber": "SO/31/2025"}	{"username": "9755827797"}	{"fixedCharge": 500, "ratePerSqft": 1.5, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	\N	2026-06-15 14:41:09.978	2026-06-15 15:55:23.391
dc3e1366-551e-4118-8805-e8376c447de8	8	7	{"city": "Indore", "name": "Brilliant Group Soceity Indore", "state": "Mp", "address": "251, Address here", "pincode": "452011", "contactEmail": "brill@mailinator.com", "contactPhone": "9755827797", "registrationNumber": "MP/2025/31"}	{"username": "brill_admin"}	\N	2026-06-16 12:01:33.391	2026-06-16 11:59:42.465	2026-06-16 12:01:33.391
1c9ff0cd-0592-4ff2-811f-7551fa2a30e2	9	1	\N	\N	\N	\N	2026-06-16 13:08:24.958	2026-06-16 13:08:24.958
d61da393-0eb9-457b-8989-56bc9cd79c6a	13	7	{"city": "Indore", "name": "Vipin Vihar MIG", "state": "Madhya Pradesh", "address": "MIG Colony", "pincode": "452010", "contactEmail": "sandy@mailinator.com", "contactPhone": "9713599998", "registrationNumber": "MP/RE/2000123"}	{"username": "vipin_vihar_admin"}	{"fixedCharge": 500, "ratePerSqft": 0, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	2026-07-02 14:38:52.716	2026-07-02 14:35:56.184	2026-07-02 14:38:52.718
5de96753-deb6-4703-9eae-8c7048c8c577	11	1	\N	\N	\N	\N	2026-07-02 09:56:50.326	2026-07-02 09:56:50.326
46c5a69d-ffdb-4b26-ab8a-34533db401c6	10	7	{"city": "Indore", "name": "alpha to delta", "state": "Madhya Pradesh", "address": "251, Chhoti Khajrani, Near MR 9 Indore", "pincode": "452011", "contactEmail": "alpha@mailinator.com", "contactPhone": "9755827797", "registrationNumber": "MP/SC/2025/31"}	{"username": "alpha_admin"}	{"fixedCharge": 900, "ratePerSqft": 1.25, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	2026-07-02 10:03:31.287	2026-06-16 14:50:16.205	2026-07-02 10:03:31.287
e8e7bda8-0451-44c0-aa2c-d026ec820c59	14	7	{"city": "Indore", "name": "Gautam Residency Indore", "state": "Madhya Pradesh", "address": "251, Chhoti Khajrani, Near MR 9 Indore", "pincode": "452011", "contactEmail": "admin@gr.com", "contactPhone": "9755827797", "registrationNumber": "MP/SR/202531"}	{"username": "gr_admin"}	{"fixedCharge": 700, "ratePerSqft": 1, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	2026-07-10 12:22:42.067	2026-07-10 12:21:19.738	2026-07-10 12:22:42.068
ba7a0a32-f473-4820-9e81-6e974addc08a	12	7	{"city": "Bhopal", "name": "Pink City", "state": "Madhya Pradesh", "address": "200, Pink City near Ring road", "pincode": "456001", "contactEmail": "pinkcity@mailinator.com", "contactPhone": "6264896147", "registrationNumber": "MP/BP/20001"}	{"username": "pink_city_admin"}	{"fixedCharge": 0, "ratePerSqft": 2.25, "lateFeePerDay": 10, "billVacantFlats": true, "lateFeeGraceDays": 10}	2026-07-02 10:08:41.515	2026-07-02 10:04:20.58	2026-07-02 10:08:41.516
\.


--
-- Data for Name: parking_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.parking_slots (id, "slotNumber", "flatId", "vehicleNumber", "vehicleType", "isOccupied", "createdAt", "updatedAt", "societyId") FROM stdin;
daa05485-7cf6-4104-b107-0e85dd54216a	P-001	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
89f19171-b263-4b28-954f-103b8996027b	P-002	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
44541177-a7a1-458a-b072-632b1d67c3f1	P-003	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
d1e97225-4b77-4ba5-ab11-cf4a86b6beb3	P-004	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
8e5513b6-294f-4994-9b49-9b1f3e7bcaf4	P-005	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
cce7cdde-6067-4f3e-84a2-c28391cbe554	P-006	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
54bffe0c-a411-49c5-805f-988191a69636	P-007	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
5c956c4c-644f-4aba-891c-97a49720aa1e	P-008	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
1ce10fcb-b0d9-46f9-96a1-69f1a88d6ff3	P-009	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
6b24ccd3-f480-4678-b5f7-f8a5b6c08ae1	P-010	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
8f5ecf5b-66aa-4cf7-9baf-fe7414123a61	P-011	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
1b7ecf5d-bf9c-4e1e-a052-0233fe25b61e	P-012	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
f21e58b9-00c1-460c-a730-bfcf84f45709	P-013	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
cd17ad72-27b8-4716-821f-9f3fb08dddbf	P-014	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
08ece924-bc62-4e1a-b268-4c31503ecf25	P-015	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
44d58659-98fd-4690-9aa7-1552ac290751	P-016	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
56fa802f-7106-4554-b812-03be024f9b56	P-017	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
e89eb917-cd09-4fdf-8cec-21a49c8fb425	P-018	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
bcbb6c61-38dd-4e63-a66d-0f3a7fb86969	P-019	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
dc9fb31a-a16d-41bc-a62c-f60bbf8eeee3	P-020	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
f53f64b6-bc56-481c-bb9a-c3484b5964af	P-021	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
7221505f-d511-4ab3-8900-01c8e0309651	P-022	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
6f80b844-bcaf-44f4-a14c-9820b5527943	P-023	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
bc70413c-aa5f-4ea0-8220-be1de2059569	P-024	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
7495a00f-4236-492c-ab66-fbd0f9309eb7	P-025	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
7def50cc-823b-4b76-bc50-81e9001c7a90	P-026	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
f1780ab3-8f10-4553-b3e0-d676f2b1b2b6	P-027	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
0cc46610-bbea-495a-aefd-8bf0184f501b	P-028	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
1c573bff-edbe-4536-a631-f5f349ffb379	P-029	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
b39d18c5-d96a-4f93-ab98-573d2aa574a0	P-030	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
1ed75941-92ea-46fd-8f72-53956f97c264	P-031	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
4805fd56-8793-46e0-b2b1-8537c9b2add5	P-032	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
bb1f164e-91bd-4322-aa36-c474aa584f95	P-033	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
1c5d647f-3cf2-4ef1-acb7-863108d72d4f	P-034	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
993d13d9-f0a8-4816-a4d7-094055967056	P-035	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
46375842-0bc6-4d3e-8b0a-fa5eb1aba81f	P-036	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
c10c2338-05b2-42e7-87d8-a56fe72efce6	P-037	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
2578f31b-ad53-4bb0-b65c-4bae8ed08e63	P-038	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
79b43b6f-373d-4bad-9668-6afdabb3e48a	P-039	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
7cbf48ef-7af9-4f68-9edb-77bc667451cc	P-040	\N	\N	\N	f	2026-05-15 07:23:37.789	2026-05-15 07:23:37.789	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, "userId", token, "expiresAt", "usedAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, "billId", "amountPaid", "paidOn", "paymentMode", notes, "recordedBy", "createdAt", "updatedAt") FROM stdin;
593260b9-346f-40ae-8127-96330c4cd092	e406a697-6abc-439c-8107-c0a6d51bbfaa	2300	2026-06-05 08:27:42.865	upi	UPI transfer ref #12345	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-05 08:27:42.865	2026-06-05 08:27:42.865
875fec2d-293a-4093-8bfb-19d54d4a3565	7fc5f92c-a6b6-43bf-8c56-5575b00a2531	1700	2026-06-05 08:28:34.492	upi	UPI transfer ref #12345	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-05 08:28:34.493	2026-06-05 08:28:34.493
0f73cc7f-2fb3-4590-9386-80216eab1659	59309ebf-7115-4f72-96e2-f0a802b0870b	1700	2026-06-07 00:00:00	upi	1131313645	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-07 07:56:52.751	2026-06-07 07:56:52.751
a8ce6cdc-0d65-45fb-817b-62b684085b43	bad85cb2-b99e-4032-995c-bc0a339d4c6e	3400	2026-06-07 00:00:00	cash	\N	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-07 07:57:30.538	2026-06-07 07:57:30.538
fdc0d3c7-33d1-44c8-9faf-1f7e3d2d7720	661a91c6-50f3-431d-a4bb-57a1d5548438	1700	2026-06-07 00:00:00	cash	\N	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-07 08:36:34.586	2026-06-07 08:36:34.586
b697ae6c-5e94-4904-805c-7c7028fa2894	04c2cc12-21c9-4bef-9af3-4ad7ab94bfea	2150	2026-06-17 10:31:30.729	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:31:30.749	2026-06-17 10:31:30.749
245cd08f-628b-4a11-b79e-054c2e5a5088	a6351576-9b23-44f3-b045-2a7aca32f474	2150	2026-06-17 10:31:39.663	upi	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:31:39.712	2026-06-17 10:31:39.712
08506472-5125-488e-96d9-3ca779a33953	15cb420a-d38b-43cb-9891-7a87dcafd339	2150	2026-06-17 10:31:44.41	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:31:44.415	2026-06-17 10:31:44.415
5764d93a-03ab-48cf-bc67-20bc77154133	6404915b-5770-4441-8530-52f1696922d2	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.817	2026-06-17 10:32:03.817
81d8dfa8-7bb9-4d54-aa73-d3d8ef06101b	929dc0e8-9e9b-472b-8412-166ee787a77e	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.821	2026-06-17 10:32:03.821
1f5a1f03-5864-4321-832b-a50fd44febdf	bebc3464-de4e-4c8c-95db-a947d97dff6b	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.826	2026-06-17 10:32:03.826
ae39a811-7e82-465b-914f-0c1ee46aa1db	2ec3573c-805f-4559-84a8-a12b52ca1321	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.831	2026-06-17 10:32:03.831
493e4349-edd2-4b8b-a6a3-686bea5afa1c	2d4579d3-535c-419b-9a5c-cd6131f39053	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.835	2026-06-17 10:32:03.835
d22e6a38-8b2a-45ac-821f-0127a223be67	ca2c55c0-def1-4ec8-b568-a6fc1595cfef	2150	2026-06-17 10:32:03.808	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 10:32:03.838	2026-06-17 10:32:03.838
56f6dd49-d180-4405-847c-ea7422057093	2a23ff82-cdf1-4032-9263-ec927ef3fb27	3100	2026-06-17 12:33:20.814	cash	\N	4a82256a-dc45-4ad9-bf5b-237025101ec8	2026-06-17 12:33:20.827	2026-06-17 12:33:20.827
c521dfc1-137b-4b0a-ae68-df1d6686daf0	ba3db469-dbef-4337-841b-1b898a17f0f5	2150	2026-06-17 16:21:01.758	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:21:01.763	2026-06-17 16:21:01.763
58ec17a9-e3d9-49dd-b1ff-c25128ea31b7	36ddc3ff-3eca-4cd5-acc3-3b84ebe9976d	2150	2026-06-17 16:23:03.598	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:23:03.605	2026-06-17 16:23:03.605
c1e8c8c9-585d-47f9-a8aa-5751245f4055	97036ec8-1543-4c02-b60b-b253617fb1e9	2150	2026-06-17 16:23:03.598	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:23:03.615	2026-06-17 16:23:03.615
6d0ad0d8-cb58-42d7-a36f-98d6f1dbc25b	ce29a3a9-fd89-4311-a141-212ce333ad35	2150	2026-06-17 16:23:03.598	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:23:03.62	2026-06-17 16:23:03.62
2d87b597-6361-4124-a81d-3cb1eda5234a	21fad7ff-33bd-4fd3-8e6e-8e5cc22069fa	2150	2026-06-17 16:23:03.598	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:23:03.625	2026-06-17 16:23:03.625
25bab69f-2b61-4146-8250-0e9e4f7dabed	3ef5c5da-ed99-4ad9-a0ca-9d802c5544dd	2150	2026-06-17 16:23:03.598	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:23:03.631	2026-06-17 16:23:03.631
9e2db2b7-744e-489a-bca6-1cbd4d6c9f7f	accdf998-30b5-448c-80f0-a8bd9bf89b8f	2150	2026-06-17 16:29:22.534	upi	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:29:22.541	2026-06-17 16:29:22.541
9b3185a9-1313-4ef5-93ad-5091852d1a65	7dd6d5c8-d721-486d-8199-ef0eb8bbc8c7	2150	2026-06-17 16:33:08.355	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:33:08.359	2026-06-17 16:33:08.359
6a2f05cc-a77d-4e4b-a6de-f20fd933b925	87d30c72-b08d-4ac9-a5c7-55f24cf2eb6e	2150	2026-06-17 16:33:42.577	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:33:42.58	2026-06-17 16:33:42.58
a9c02537-18c8-4013-bc42-5c4032074d31	8c0131ff-2003-4022-9f11-e9bfe093d4f6	2150	2026-06-17 16:36:01.044	bank_transfer	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:36:01.051	2026-06-17 16:36:01.051
d5e11f3d-70af-4eeb-a545-8ae05ff6dc6a	eb0886b6-d4e5-42f0-b791-f0fa59c7fab2	2150	2026-06-17 16:39:15.891	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:39:15.896	2026-06-17 16:39:15.896
85b7d483-1be1-4abe-be3f-0a8ba85b05ad	35c4d24f-0cea-4677-a1e6-2cd8079c5b27	2150	2026-06-17 16:39:23.397	bank_transfer	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:39:23.4	2026-06-17 16:39:23.4
3ceae59e-75a9-4c75-b315-5bdb6ffca8d2	bd67e7b7-f865-4dc4-a8c9-0c2d72af2c8e	2150	2026-06-17 16:39:31.553	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:39:31.557	2026-06-17 16:39:31.557
c036d930-b585-4af6-b259-d534d3654310	c7fcf159-042a-42b7-831a-8aebf2cb0fef	2150	2026-06-17 16:41:02.155	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-17 16:41:02.158	2026-06-17 16:41:02.158
dfacb68e-f0a0-41b2-8602-1f03bcf91512	b14070af-b5c7-4c1e-8f00-5db145463550	2150	2026-06-18 05:28:23.415	bank_transfer	133211333	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 05:28:23.423	2026-06-18 05:28:23.423
79315bb4-c004-4f3e-8f51-60066a013b08	9d79b478-22b1-4e0c-b185-eda729d8d9c3	2150	2026-06-18 05:30:36.886	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 05:30:36.889	2026-06-18 05:30:36.889
af9e4f41-4a03-4165-955d-0badc62884f2	c17cfd7e-68cc-4922-98de-94013bf8a37b	2150	2026-06-18 05:30:53.292	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 05:30:53.295	2026-06-18 05:30:53.295
117bfa1c-f762-45e0-a31d-e87c93a90051	4cd32cba-b4e4-451d-a251-fc4e149db755	2150	2026-06-18 05:49:51.572	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 05:49:51.575	2026-06-18 05:49:51.575
0b0c18c7-a952-4992-a298-50262dc79a3f	449b2845-d7a7-4f13-a973-9f152a4f3738	2150	2026-06-18 05:50:54.327	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 05:50:54.331	2026-06-18 05:50:54.331
10564dd1-30ae-4743-97f3-77c12a469f0a	958b2b7a-a89f-435f-9539-c7401f012b0a	2150	2026-06-18 06:06:34.155	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:06:34.158	2026-06-18 06:06:34.158
3fee8fe3-52e3-4a0e-8fea-8b3ac48e822d	567a385a-e4be-4751-a786-cd25bbf3e007	2150	2026-06-18 06:06:41.943	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:06:41.945	2026-06-18 06:06:41.945
32b609ea-f907-4a71-8922-50f9a1843756	dc4fc1e9-4fd9-41f0-8aff-d77cc8d5b0b6	2150	2026-06-18 06:06:41.943	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:06:41.949	2026-06-18 06:06:41.949
a52b4117-33ed-41c2-9b03-cd7bd1853bfe	e12af8e8-a0ea-4905-9534-a28f8b0a9e92	2150	2026-06-18 06:06:41.943	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:06:41.952	2026-06-18 06:06:41.952
0ce10bb1-cd8a-4387-833c-86aecb09b6ed	3477ad19-0e60-4727-939d-0dac68136603	2150	2026-06-18 06:06:41.943	cash	\N	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-18 06:06:41.955	2026-06-18 06:06:41.955
1be68dcc-8c38-44d4-bb6f-ac2026fc6dbe	f58cce26-e9b4-41f4-99f3-20b22a43263a	500	2026-07-02 14:42:24.065	cash	\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-02 14:42:24.067	2026-07-02 14:42:24.067
e1fc2824-6f23-44ca-98b0-06322b1dbb12	b4b546c4-8c01-4533-aedc-d2c9c43e5ed6	2250	2026-07-03 13:17:55.123	upi	Ref: 45446465	5e529bb8-2137-47cf-88d4-455a57445a68	2026-07-03 13:17:55.128	2026-07-03 13:17:55.128
54fbedd0-ff36-4c3f-b21b-8e0d10827c50	89550bf3-044b-4900-aaa9-758898b3cac7	2250	2026-07-03 13:18:12.579	upi	Ref: 45645456+	5e529bb8-2137-47cf-88d4-455a57445a68	2026-07-03 13:18:12.582	2026-07-03 13:18:12.582
67a8dcda-2e03-48a9-9b19-8ea2793a8bdd	501fcfad-fbc5-4da1-81e1-74a4258a2eee	500	2026-07-03 15:16:18.197	cash	\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-03 15:16:18.203	2026-07-03 15:16:18.203
f0931a22-1890-4d0f-b193-27dabfd3777a	6b2151b4-57f1-4a65-926f-74175be6ca19	500	2026-07-03 15:16:35.025	upi	\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-03 15:16:35.035	2026-07-03 15:16:35.035
68cc57b2-2686-46a8-83a3-e7e2c8adbef3	e54ecaa9-c4e3-4c4c-8dc0-1684c3fce50a	500	2026-07-03 15:16:35.025	upi	\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-03 15:16:35.044	2026-07-03 15:16:35.044
fc08fd17-76d4-44e0-b2bf-0728ba6dfbbc	28862a6b-f3df-4bff-827f-5eb5073647f3	500	2026-07-03 15:16:35.025	upi	\N	2e35e707-3cd2-4639-82a1-52090cde4638	2026-07-03 15:16:35.051	2026-07-03 15:16:35.051
\.


--
-- Data for Name: residents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.residents (id, name, email, phone, whatsapp, "flatId", "residentType", "isActive", "moveInDate", "moveOutDate", "numCars", "numBikes", "createdAt", "updatedAt", "dateOfBirth", "idProofType", "idProofNumber", "emergencyContactName", "emergencyContactPhone") FROM stdin;
244152f9-4cad-4ffe-bb78-7034547a12f5	Rajesh Kumar	rajesh.kumar@test.com	9876543210	\N	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	owner	t	2026-06-05 08:19:55.466	\N	0	0	2026-06-05 08:19:55.466	2026-06-05 08:19:55.466	\N	\N	\N	\N	\N
3cdfdb5b-d836-442e-8617-bffcb46bc000	dilip	dilip@mailinator.com	9755827797	\N	031546ee-e650-4153-8f4c-1fc7f14d9e6c	owner	t	2026-06-27 00:00:00	\N	0	0	2026-06-27 08:53:05.594	2026-07-01 15:56:42.181	\N	\N	\N	\N	\N
961ed236-315f-4b57-9623-b38019546799	Adams	\N	6264896147	\N	773bd0bb-f52a-4561-98ad-cd040ecbd694	owner	t	2026-07-02 13:22:22.911	\N	0	0	2026-07-02 13:22:22.911	2026-07-02 13:22:22.911	\N	\N	\N	\N	\N
c01e74b4-748f-40c4-a33d-e513a07f0fdb	Tenant of adams	\N	6666525822	\N	773bd0bb-f52a-4561-98ad-cd040ecbd694	tenant	t	2026-07-02 13:22:49.189	\N	0	0	2026-07-02 13:22:49.189	2026-07-02 13:22:49.189	\N	\N	\N	\N	\N
c6bd2a61-69cd-4ca6-ac66-8ae9ef43a0da	Sandeep	\N	9998776689	\N	58367c1f-2066-4b50-aba3-dd11c325f0db	owner	t	2026-07-02 14:40:03.694	\N	0	0	2026-07-02 14:40:03.694	2026-07-02 14:40:03.694	\N	\N	\N	\N	\N
926ee287-6577-4dcf-9760-8b16c08082fa	Rahul Sharma	\N	97888578789	\N	ee031c91-748a-425c-86b6-591352a460ca	owner	t	2026-07-03 12:42:25.709	\N	0	0	2026-07-03 12:42:25.709	2026-07-03 12:42:25.709	\N	\N	\N	\N	\N
791e821a-9f19-4d9d-8517-b934d53b8de2	John Smith	john.smith@email.com	9876543210	\N	0271539f-8a09-4bc5-8954-628415ed3971	owner	t	2026-07-03 12:58:58.293	\N	0	0	2026-07-03 12:58:58.295	2026-07-03 12:58:58.295	\N	\N	\N	\N	\N
7c8b30fc-9297-438d-bc9c-60472614ff3f	Jane Garcia	jane.garcia2@email.com	9876543211	\N	79e2f043-4198-4714-9f23-2739aeef96cb	owner	t	2026-07-03 12:58:58.374	\N	0	0	2026-07-03 12:58:58.375	2026-07-03 12:58:58.375	\N	\N	\N	\N	\N
1bcfa1f3-12c9-4a53-a0bd-88bca7c1b21d	Robert Rodriguez	robert.rodriguez3@email.com	9876543212	\N	015c39fc-d102-4a90-b1e8-668f555c4aa7	tenant	t	2026-07-03 12:58:58.45	\N	0	0	2026-07-03 12:58:58.451	2026-07-03 12:58:58.451	\N	\N	\N	\N	\N
9c1e402b-33b3-419c-8789-3807c89a3164	Mary Lopez	mary.lopez4@email.com	9876543213	\N	22d6b732-65c2-4668-a83a-52b7bac56cdf	owner	t	2026-07-03 12:58:58.518	\N	0	0	2026-07-03 12:58:58.519	2026-07-03 12:58:58.519	\N	\N	\N	\N	\N
7db9d9e5-995b-4cc1-8e76-36aa92214583	Michael Anderson	michael.anderson5@email.com	9876543214	\N	58215653-c025-4bec-838a-0d9b3c6612ec	owner	t	2026-07-03 12:58:58.588	\N	0	0	2026-07-03 12:58:58.588	2026-07-03 12:58:58.588	\N	\N	\N	\N	\N
3830ab01-d222-4a92-aad1-b5b4d7d5534f	David Moore	david.moore6@email.com	9876543215	\N	50d1ecd6-c35d-423c-a363-f9ddc4157e5d	tenant	t	2026-07-03 12:58:58.66	\N	0	0	2026-07-03 12:58:58.661	2026-07-03 12:58:58.661	\N	\N	\N	\N	\N
781e05f5-111b-444a-b8d8-8534d3e6ae0d	James Doe	james.doe7@email.com	9876543216	\N	c968a093-2335-4021-b46b-83b3ff259092	owner	t	2026-07-03 12:58:58.725	\N	0	0	2026-07-03 12:58:58.726	2026-07-03 12:58:58.726	\N	\N	\N	\N	\N
6b13220d-08d7-4310-a3af-87c2f77a5cfa	Patricia Williams	patricia.williams8@email.com	9876543217	\N	c5c32892-6cc2-4d91-b700-69e72cacca0a	owner	t	2026-07-03 12:58:58.791	\N	0	0	2026-07-03 12:58:58.792	2026-07-03 12:58:58.792	\N	\N	\N	\N	\N
0a9881c2-8f3c-44d6-ac8e-94e400da8aa8	Linda Miller	linda.miller9@email.com	9876543218	\N	eb8b5263-f0d6-4078-ab29-13ef3f0e4d19	tenant	t	2026-07-03 12:58:58.858	\N	0	0	2026-07-03 12:58:58.859	2026-07-03 12:58:58.859	\N	\N	\N	\N	\N
d8dffa87-aab4-4e22-8155-3fa91111710d	Barbara Martinez	barbara.martinez10@email.com	9876543219	\N	295d28cf-1700-45fd-be32-d08bc76f802f	owner	t	2026-07-03 12:58:58.926	\N	0	0	2026-07-03 12:58:58.927	2026-07-03 12:58:58.927	\N	\N	\N	\N	\N
89ae359a-6cc3-4b48-a751-c8c219635a38	William Gonzalez	william.gonzalez11@email.com	9876543220	\N	a9197ab3-8dab-4cf8-baf9-db9f6097ebeb	owner	t	2026-07-03 12:58:58.993	\N	0	0	2026-07-03 12:58:58.993	2026-07-03 12:58:58.993	\N	\N	\N	\N	\N
838322d4-70d7-4151-9351-7356eb92ccfc	Elizabeth Thomas	elizabeth.thomas12@email.com	9876543221	\N	c0493c68-83bc-4d09-b8f0-b1c9c6ca7efd	tenant	t	2026-07-03 12:58:59.058	\N	0	0	2026-07-03 12:58:59.059	2026-07-03 12:58:59.059	\N	\N	\N	\N	\N
a3972027-a8b9-4196-8f2c-c9238d4af557	Joseph Jackson	joseph.jackson13@email.com	9876543222	\N	fc9bd77b-9388-48fd-8c94-57f93fa3a5db	owner	t	2026-07-03 12:58:59.123	\N	0	0	2026-07-03 12:58:59.124	2026-07-03 12:58:59.124	\N	\N	\N	\N	\N
86be879a-cf6c-4618-8a1e-980e22e206e8	Susan Johnson	susan.johnson14@email.com	9876543223	\N	134ce985-f64c-423b-a5e2-d8419dde5535	owner	t	2026-07-03 12:58:59.188	\N	0	0	2026-07-03 12:58:59.189	2026-07-03 12:58:59.189	\N	\N	\N	\N	\N
b511cb9f-c687-4065-9586-053b7b028ed9	Thomas Jones	thomas.jones15@email.com	9876543224	\N	9125e256-6bad-4fc6-8507-465c9a4e8280	tenant	t	2026-07-03 12:58:59.256	\N	0	0	2026-07-03 12:58:59.257	2026-07-03 12:58:59.257	\N	\N	\N	\N	\N
a1950098-b069-4fb1-b062-7d15fa59574b	Jessica Davis	jessica.davis16@email.com	9876543225	\N	6acab449-31dd-4aa4-b3d4-94a0e804d3ac	owner	t	2026-07-03 12:58:59.321	\N	0	0	2026-07-03 12:58:59.322	2026-07-03 12:58:59.322	\N	\N	\N	\N	\N
77eb0beb-9225-43b4-9a44-b6d5791d63de	Sarah Hernandez	sarah.hernandez17@email.com	9876543226	\N	3209c85b-674f-4c09-ae62-2e8f85a0d7a7	owner	t	2026-07-03 12:58:59.387	\N	0	0	2026-07-03 12:58:59.389	2026-07-03 12:58:59.389	\N	\N	\N	\N	\N
15d2fb4f-26c2-4ab6-b408-1831c943d6e6	Karen Wilson	karen.wilson18@email.com	9876543227	\N	be76b827-1cae-4e42-993a-be5e009bb098	tenant	t	2026-07-03 12:58:59.454	\N	0	0	2026-07-03 12:58:59.455	2026-07-03 12:58:59.455	\N	\N	\N	\N	\N
2512106a-e376-4129-89e9-ff7b1f540b23	Nancy Taylor	nancy.taylor19@email.com	9876543228	\N	21bedbf1-183e-455c-8d02-688afe94e192	owner	t	2026-07-03 12:58:59.521	\N	0	0	2026-07-03 12:58:59.522	2026-07-03 12:58:59.522	\N	\N	\N	\N	\N
89f66b63-7f7f-4538-801c-4fedde64bfae	Lisa Smith	lisa.smith20@email.com	9876543229	\N	a5af25e8-39ed-4cc7-aa1c-e17ac926dc8d	owner	t	2026-07-03 12:58:59.587	\N	0	0	2026-07-03 12:58:59.588	2026-07-03 12:58:59.588	\N	\N	\N	\N	\N
db39c560-e4a9-43b9-b28f-583fcb0ae726	John Brown	john.brown21@email.com	9876543230	\N	b2731bf3-c10f-46a5-8a98-e16e2bb7dd82	tenant	t	2026-07-03 12:58:59.656	\N	0	0	2026-07-03 12:58:59.657	2026-07-03 12:58:59.657	\N	\N	\N	\N	\N
9dc6769b-16e0-4fb6-ab23-9db89d95a3a2	Jane Hernandez	jane.hernandez22@email.com	9876543231	\N	0b98ca1a-1e0b-42ab-827a-c66388df288e	owner	t	2026-07-03 12:58:59.723	\N	0	0	2026-07-03 12:58:59.725	2026-07-03 12:58:59.725	\N	\N	\N	\N	\N
fb3d8fc4-9e68-480a-bcd9-16f07d6323df	Robert Wilson	robert.wilson23@email.com	9876543232	\N	5c310f84-c23e-4c2e-a0b2-0511bacc7027	owner	t	2026-07-03 12:58:59.789	\N	0	0	2026-07-03 12:58:59.79	2026-07-03 12:58:59.79	\N	\N	\N	\N	\N
dc4c78fc-f6ad-497f-a2e0-bbcb8359cd8b	Mary Taylor	mary.taylor24@email.com	9876543233	\N	c781c795-c7b0-425b-843d-a793d5885ee7	tenant	t	2026-07-03 12:58:59.856	\N	0	0	2026-07-03 12:58:59.857	2026-07-03 12:58:59.857	\N	\N	\N	\N	\N
b2949a33-e120-46d6-918b-5aec4a3abaad	Michael Smith	michael.smith25@email.com	9876543234	\N	1341ab46-7c6f-407e-b9d4-e8b1b205a9f3	owner	t	2026-07-03 12:58:59.924	\N	0	0	2026-07-03 12:58:59.926	2026-07-03 12:58:59.926	\N	\N	\N	\N	\N
64511d6c-cecb-49f0-891d-9506b06b9142	David Doe	david.doe26@email.com	9876543235	\N	1cc450f2-f4f4-4a36-a77b-d1b7c1fe091c	owner	t	2026-07-03 12:58:59.991	\N	0	0	2026-07-03 12:58:59.992	2026-07-03 12:58:59.992	\N	\N	\N	\N	\N
b2555119-62fe-437b-b776-d48d003c6f93	James Williams	james.williams27@email.com	9876543236	\N	dac28408-01de-4fd2-85f0-49e03b506c12	tenant	t	2026-07-03 12:59:00.058	\N	0	0	2026-07-03 12:59:00.059	2026-07-03 12:59:00.059	\N	\N	\N	\N	\N
b6d40d59-bddb-4a2a-b446-d303dbcce4f1	Patricia Jones	patricia.jones28@email.com	9876543237	\N	7dca1382-40fc-4273-b715-ee17849c1407	owner	t	2026-07-03 12:59:00.123	\N	0	0	2026-07-03 12:59:00.124	2026-07-03 12:59:00.124	\N	\N	\N	\N	\N
d293dd0c-5f3d-41d7-9f62-db7799869374	Linda Rodriguez	linda.rodriguez29@email.com	9876543238	\N	14a81fe0-7e65-434c-b41a-3191f085ad86	owner	t	2026-07-03 12:59:00.19	\N	0	0	2026-07-03 12:59:00.191	2026-07-03 12:59:00.191	\N	\N	\N	\N	\N
e58e69b6-0780-417e-b55e-6f1a4c59cad9	Barbara Gonzalez	barbara.gonzalez30@email.com	9876543239	\N	f3843f85-917b-475d-b51c-31f0877ed8ff	tenant	t	2026-07-03 12:59:00.259	\N	0	0	2026-07-03 12:59:00.26	2026-07-03 12:59:00.26	\N	\N	\N	\N	\N
62aa0d0b-df0a-45e6-97f7-1fe04db631c0	William Moore	william.moore31@email.com	9876543240	\N	b697cacf-7aac-4c54-b847-4259c43347ac	owner	t	2026-07-03 12:59:00.325	\N	0	0	2026-07-03 12:59:00.326	2026-07-03 12:59:00.326	\N	\N	\N	\N	\N
6fd7f1e7-5165-4c40-b036-90565b16224c	Elizabeth Doe	elizabeth.doe32@email.com	9876543241	\N	8dd6482b-44c8-4932-9387-0d9c759a0fa2	owner	t	2026-07-03 12:59:00.387	\N	0	0	2026-07-03 12:59:00.388	2026-07-03 12:59:00.388	\N	\N	\N	\N	\N
b5f2cdf7-cd0c-41c4-9e05-cbd444dc394c	Joseph Brown	joseph.brown33@email.com	9876543242	\N	ccf3e5b1-b05b-42e8-807a-aa697c9beab8	tenant	t	2026-07-03 12:59:00.453	\N	0	0	2026-07-03 12:59:00.454	2026-07-03 12:59:00.454	\N	\N	\N	\N	\N
97b63412-ce08-4806-9747-be5ae890a9f2	Susan Davis	susan.davis34@email.com	9876543243	\N	71d7efbf-5dc6-44dc-a7b4-8d4c4e1a612a	owner	t	2026-07-03 12:59:00.519	\N	0	0	2026-07-03 12:59:00.52	2026-07-03 12:59:00.52	\N	\N	\N	\N	\N
fb3fbb12-69c9-464a-b041-bd043879d519	Thomas Martinez	thomas.martinez35@email.com	9876543244	\N	94c471a4-8548-4f56-a18c-aa9df1de893e	owner	t	2026-07-03 12:59:00.591	\N	0	0	2026-07-03 12:59:00.592	2026-07-03 12:59:00.592	\N	\N	\N	\N	\N
60587923-6fb6-4603-92d8-50f82369f0b5	Jessica Jackson	jessica.jackson36@email.com	9876543245	\N	36451262-4117-4d12-84b3-5c16b9cebc27	tenant	t	2026-07-03 12:59:00.665	\N	0	0	2026-07-03 12:59:00.666	2026-07-03 12:59:00.666	\N	\N	\N	\N	\N
f1382a62-37e8-459a-88c0-ce36829b6192	Sarah Smith	sarah.smith37@email.com	9876543246	\N	783b71dd-fc28-4671-8313-209f02919a46	owner	t	2026-07-03 12:59:00.728	\N	0	0	2026-07-03 12:59:00.729	2026-07-03 12:59:00.729	\N	\N	\N	\N	\N
75bbb33d-cd10-4ecb-a640-45cbed19b760	Karen Garcia	karen.garcia38@email.com	9876543247	\N	e56f88f7-ae5b-49ff-8cf8-e383b70fb9c9	owner	t	2026-07-03 12:59:00.794	\N	0	0	2026-07-03 12:59:00.795	2026-07-03 12:59:00.795	\N	\N	\N	\N	\N
5c3e798f-37ee-41ff-8229-0b5d0b7cbb3f	Nancy Hernandez	nancy.hernandez39@email.com	9876543248	\N	55a280c8-037e-4f6f-bbd1-e6fd44cb5120	tenant	t	2026-07-03 12:59:00.859	\N	0	0	2026-07-03 12:59:00.86	2026-07-03 12:59:00.86	\N	\N	\N	\N	\N
42568d89-4db3-4e23-b0d3-86b73cadefc1	Lisa Thomas	lisa.thomas40@email.com	9876543249	\N	3a9d7e72-c992-46ce-bfb0-962ea1f02e13	owner	t	2026-07-03 12:59:00.924	\N	0	0	2026-07-03 12:59:00.925	2026-07-03 12:59:00.925	\N	\N	\N	\N	\N
9a5e7dad-132b-4c6e-983c-582730a4f57b	John Jackson	john.jackson41@email.com	9876543250	\N	2db48490-f13d-4cdb-b762-bf3b191fe490	owner	t	2026-07-03 12:59:00.991	\N	0	0	2026-07-03 12:59:00.993	2026-07-03 12:59:00.993	\N	\N	\N	\N	\N
af518e62-efab-460f-9078-19c462007ea4	Jane Johnson	jane.johnson42@email.com	9876543251	\N	2d28cf72-41dc-4382-aea9-c452474ad64e	tenant	t	2026-07-03 12:59:01.057	\N	0	0	2026-07-03 12:59:01.058	2026-07-03 12:59:01.058	\N	\N	\N	\N	\N
c066ca13-3d0b-4c63-8ff9-f5441eb2ea00	Robert Jones	robert.jones43@email.com	9876543252	\N	c21d098a-22ea-4234-b38f-8f3c91384f48	owner	t	2026-07-03 12:59:01.123	\N	0	0	2026-07-03 12:59:01.124	2026-07-03 12:59:01.124	\N	\N	\N	\N	\N
b6a90391-3765-49a5-b278-a039c603117c	Mary Davis	mary.davis44@email.com	9876543253	\N	45985f42-bc1f-47ae-be3f-6e98096311e2	owner	t	2026-07-03 12:59:01.187	\N	0	0	2026-07-03 12:59:01.188	2026-07-03 12:59:01.188	\N	\N	\N	\N	\N
2ca88459-564e-43af-bd68-a1da89a5fff9	Michael Hernandez	michael.hernandez45@email.com	9876543254	\N	839749a1-6f4a-46b1-a406-1029274bb2cf	tenant	t	2026-07-03 12:59:01.252	\N	0	0	2026-07-03 12:59:01.254	2026-07-03 12:59:01.254	\N	\N	\N	\N	\N
bf12373e-16ad-4ff5-8a2d-dad9bd6b49d2	David Wilson	david.wilson46@email.com	9876543255	\N	1c558af1-b2e7-45f8-a34a-16bd94d7c355	owner	t	2026-07-03 12:59:01.32	\N	0	0	2026-07-03 12:59:01.321	2026-07-03 12:59:01.321	\N	\N	\N	\N	\N
a0777291-4ebb-44f4-838a-cc2f2325b003	James Taylor	james.taylor47@email.com	9876543256	\N	684e6f88-20b0-478a-887c-3059ad52189b	owner	t	2026-07-03 12:59:01.386	\N	0	0	2026-07-03 12:59:01.387	2026-07-03 12:59:01.387	\N	\N	\N	\N	\N
ddb61876-67c7-4395-a258-42f904992316	Patricia Moore	patricia.moore48@email.com	9876543257	\N	67591685-8002-4806-9d19-f602f856e143	tenant	t	2026-07-03 12:59:01.45	\N	0	0	2026-07-03 12:59:01.451	2026-07-03 12:59:01.451	\N	\N	\N	\N	\N
be4e293e-9e1c-4832-9eab-74c0dbaa4727	Linda Smith	linda.smith49@email.com	9876543258	\N	091e0ffa-a9e6-45ae-b981-17a1d38d13f6	owner	t	2026-07-03 12:59:01.516	\N	0	0	2026-07-03 12:59:01.517	2026-07-03 12:59:01.517	\N	\N	\N	\N	\N
9b8de1c2-606e-44d7-863a-38c1dadc2ac9	Barbara Doe	barbara.doe50@email.com	9876543259	\N	5d009904-d998-448f-a525-6aef713d9748	owner	t	2026-07-03 12:59:01.582	\N	0	0	2026-07-03 12:59:01.583	2026-07-03 12:59:01.583	\N	\N	\N	\N	\N
b47a70bf-e782-432e-8781-be048c1dd86b	William Johnson	william.johnson51@email.com	9876543260	\N	975bfc40-4584-49b2-a83d-a6ee907534cc	tenant	t	2026-07-03 12:59:01.65	\N	0	0	2026-07-03 12:59:01.651	2026-07-03 12:59:01.651	\N	\N	\N	\N	\N
a9b12763-d066-4707-a8e3-38793d9ce373	Elizabeth Brown	elizabeth.brown52@email.com	9876543261	\N	dcf0b2c9-203f-4b69-aad1-fa90d93d7c75	owner	t	2026-07-03 12:59:01.715	\N	0	0	2026-07-03 12:59:01.716	2026-07-03 12:59:01.716	\N	\N	\N	\N	\N
ac6a65f5-d25d-4459-80cb-50daf37fc9a5	Joseph Williams	joseph.williams53@email.com	9876543262	\N	3451acad-8727-4ac2-ae72-444e61e77118	owner	t	2026-07-03 12:59:01.781	\N	0	0	2026-07-03 12:59:01.783	2026-07-03 12:59:01.783	\N	\N	\N	\N	\N
e7db5988-550a-4116-b10e-b64aac2b6acc	Susan Jones	susan.jones54@email.com	9876543263	\N	416d2f3a-e58e-4c63-a5fa-035823c87f2e	tenant	t	2026-07-03 12:59:01.846	\N	0	0	2026-07-03 12:59:01.847	2026-07-03 12:59:01.847	\N	\N	\N	\N	\N
3db1d0ca-3a0f-4145-b49a-4712b19e47b5	Thomas Garcia	thomas.garcia55@email.com	9876543264	\N	acacb9cb-359f-4879-a8c8-063cf165ec77	owner	t	2026-07-03 12:59:01.911	\N	0	0	2026-07-03 12:59:01.912	2026-07-03 12:59:01.912	\N	\N	\N	\N	\N
092efc66-aa05-4e32-b530-683db6214472	Jessica Miller	jessica.miller56@email.com	9876543265	\N	eabc42d0-e574-4c3b-9680-d11f599293a1	owner	t	2026-07-03 12:59:01.981	\N	0	0	2026-07-03 12:59:01.982	2026-07-03 12:59:01.982	\N	\N	\N	\N	\N
7052864c-085d-4373-abd0-d3e90a35aed1	Sarah Davis	sarah.davis57@email.com	9876543266	\N	c22c17f5-73ac-4c60-bf0a-fe9bf6fc6b04	tenant	t	2026-07-03 12:59:02.047	\N	0	0	2026-07-03 12:59:02.048	2026-07-03 12:59:02.048	\N	\N	\N	\N	\N
2b3ac0b4-79c4-43b9-b038-dcc94f6128cf	Karen Rodriguez	karen.rodriguez58@email.com	9876543267	\N	060a5985-8591-4879-9161-4d019f6a3ab1	owner	t	2026-07-03 12:59:02.118	\N	0	0	2026-07-03 12:59:02.119	2026-07-03 12:59:02.119	\N	\N	\N	\N	\N
3060a46c-6829-41c5-93df-78c667e1fc1e	Nancy Martinez	nancy.martinez59@email.com	9876543268	\N	c11db0f7-2963-411f-8231-62060a62fb92	owner	t	2026-07-03 12:59:02.183	\N	0	0	2026-07-03 12:59:02.184	2026-07-03 12:59:02.184	\N	\N	\N	\N	\N
d4f98c73-3ad7-4266-8c66-ed9ba2c887fd	Lisa Hernandez	lisa.hernandez60@email.com	9876543269	\N	f92b5748-42a0-4ace-8ea1-c3e9f858b2d1	tenant	t	2026-07-03 12:59:02.25	\N	0	0	2026-07-03 12:59:02.251	2026-07-03 12:59:02.251	\N	\N	\N	\N	\N
9aa8ee85-3a65-48b2-b02f-8e0b74f0c9da	John Lopez	john.lopez61@email.com	9876543270	\N	07f9e198-7645-46ce-bfc0-5c5e0ff77dec	owner	t	2026-07-03 12:59:02.317	\N	0	0	2026-07-03 12:59:02.318	2026-07-03 12:59:02.318	\N	\N	\N	\N	\N
c3048ed9-35e0-4d52-9e12-5b3f5b13dc57	Jane Gonzalez	jane.gonzalez62@email.com	9876543271	\N	bb03cf93-7122-45b8-8da9-afd0265b4b7f	owner	t	2026-07-03 12:59:02.386	\N	0	0	2026-07-03 12:59:02.387	2026-07-03 12:59:02.387	\N	\N	\N	\N	\N
a7f86a28-da2c-47f4-b80f-c0ec1aacc145	Robert Wilson	robert.wilson63@email.com	9876543272	\N	de899136-7066-4ed0-b745-fa713f12456d	tenant	t	2026-07-03 12:59:02.453	\N	0	0	2026-07-03 12:59:02.454	2026-07-03 12:59:02.454	\N	\N	\N	\N	\N
66001d25-3a5d-4c86-bae4-e827e46f51e4	Mary Anderson	mary.anderson64@email.com	9876543273	\N	ae3ef16a-51c9-4703-bd69-829d8cf92eb3	owner	t	2026-07-03 12:59:02.517	\N	0	0	2026-07-03 12:59:02.518	2026-07-03 12:59:02.518	\N	\N	\N	\N	\N
0309a72b-34e1-4e5f-82a1-3aa11505ed0b	Michael Thomas	michael.thomas65@email.com	9876543274	\N	e8dd5447-e8d3-4e88-98b5-9a6bddd0a06a	owner	t	2026-07-03 12:59:02.583	\N	0	0	2026-07-03 12:59:02.584	2026-07-03 12:59:02.584	\N	\N	\N	\N	\N
d7a8346e-f13c-4103-9f6e-be5f5d9f2145	David Taylor	david.taylor66@email.com	9876543275	\N	d71e8e40-b325-42c2-a37e-8b123578743a	tenant	t	2026-07-03 12:59:02.658	\N	0	0	2026-07-03 12:59:02.66	2026-07-03 12:59:02.66	\N	\N	\N	\N	\N
b7ff20ab-377d-45f7-8ef0-9359af3a7562	James Moore	james.moore67@email.com	9876543276	\N	93719735-ad2b-424b-9cb8-5b7d29e9df1a	owner	t	2026-07-03 12:59:02.729	\N	0	0	2026-07-03 12:59:02.73	2026-07-03 12:59:02.73	\N	\N	\N	\N	\N
73cd3276-28d8-4d66-99e5-7c9e2779290b	Patricia Jackson	patricia.jackson68@email.com	9876543277	\N	d3b0c60c-35c3-4e62-b511-6edcad3be9c8	owner	t	2026-07-03 12:59:02.8	\N	0	0	2026-07-03 12:59:02.801	2026-07-03 12:59:02.801	\N	\N	\N	\N	\N
2053b3fc-82f6-45b6-bbd8-843329aeedbd	Linda Smith	linda.smith69@email.com	9876543278	\N	ccef5571-4974-4136-87f7-e9a4b969f33c	tenant	t	2026-07-03 12:59:02.871	\N	0	0	2026-07-03 12:59:02.872	2026-07-03 12:59:02.872	\N	\N	\N	\N	\N
5b0c2ed8-6f2a-4dbf-86a4-50a81896f744	Barbara Doe	barbara.doe70@email.com	9876543279	\N	e0c2014a-99b4-40d6-847d-15a723a17ee8	owner	t	2026-07-03 12:59:02.938	\N	0	0	2026-07-03 12:59:02.939	2026-07-03 12:59:02.939	\N	\N	\N	\N	\N
b6421aa4-c611-46c2-ab5a-daad41b83931	William Johnson	william.johnson71@email.com	9876543280	\N	03625b67-e6b3-4d54-8c20-93970a91e485	owner	t	2026-07-03 12:59:03.009	\N	0	0	2026-07-03 12:59:03.01	2026-07-03 12:59:03.01	\N	\N	\N	\N	\N
9e5e4aaf-31c1-4202-8861-f4ea8cf6bd3b	Elizabeth Brown	elizabeth.brown72@email.com	9876543281	\N	b736a4b4-c916-40c3-aab6-57b577922d27	tenant	t	2026-07-03 12:59:03.076	\N	0	0	2026-07-03 12:59:03.077	2026-07-03 12:59:03.077	\N	\N	\N	\N	\N
8184d556-0612-4944-8f24-fcb179ea9c0c	Joseph Williams	joseph.williams73@email.com	9876543282	\N	85ac5b04-ee02-41ee-a1ec-0ca363468866	owner	t	2026-07-03 12:59:03.142	\N	0	0	2026-07-03 12:59:03.143	2026-07-03 12:59:03.143	\N	\N	\N	\N	\N
193ed9bd-fe08-437c-bbe6-64b94729b37c	Susan Jones	susan.jones74@email.com	9876543283	\N	c4078200-8cb4-471a-8257-a98f7a43cdb1	owner	t	2026-07-03 12:59:03.206	\N	0	0	2026-07-03 12:59:03.207	2026-07-03 12:59:03.207	\N	\N	\N	\N	\N
15ead7cc-c6cc-4818-bf73-44dc025ae48a	Thomas Garcia	thomas.garcia75@email.com	9876543284	\N	8c5b7b7f-bb25-4be6-9aa1-0d1726018236	tenant	t	2026-07-03 12:59:03.275	\N	0	0	2026-07-03 12:59:03.277	2026-07-03 12:59:03.277	\N	\N	\N	\N	\N
aaa89483-d4fd-485a-8e18-32c3155e1aa2	Jessica Miller	jessica.miller76@email.com	9876543285	\N	e3f40e01-9f23-4c59-92e1-dbc746702b32	owner	t	2026-07-03 12:59:03.338	\N	0	0	2026-07-03 12:59:03.339	2026-07-03 12:59:03.339	\N	\N	\N	\N	\N
41e9960b-e7d2-461a-b65d-77b409a17dff	Sarah Davis	sarah.davis77@email.com	9876543286	\N	b63a9500-68c5-49fd-8ae9-9e8d190dc650	owner	t	2026-07-03 12:59:03.404	\N	0	0	2026-07-03 12:59:03.404	2026-07-03 12:59:03.404	\N	\N	\N	\N	\N
617f48db-a5ea-4b2b-9595-390e3943610a	Karen Rodriguez	karen.rodriguez78@email.com	9876543287	\N	e9408249-4b89-4604-a245-99d03f4e5c22	tenant	t	2026-07-03 12:59:03.472	\N	0	0	2026-07-03 12:59:03.473	2026-07-03 12:59:03.473	\N	\N	\N	\N	\N
c2d093d1-02c9-4f24-a2e7-0956693c82ce	Nancy Martinez	nancy.martinez79@email.com	9876543288	\N	07f466b5-2439-4137-bd1a-3beff11ff6da	owner	t	2026-07-03 12:59:03.543	\N	0	0	2026-07-03 12:59:03.544	2026-07-03 12:59:03.544	\N	\N	\N	\N	\N
e8d73934-f296-4e0d-82c8-5eaf3806deed	Lisa Hernandez	lisa.hernandez80@email.com	9876543289	\N	050cf58c-6bf3-4654-8ce5-96424690c617	owner	t	2026-07-03 12:59:03.627	\N	0	0	2026-07-03 12:59:03.628	2026-07-03 12:59:03.628	\N	\N	\N	\N	\N
6687b35b-fecd-4bac-8a11-68f229e126e6	John Lopez	john.lopez81@email.com	9876543290	\N	7deff147-8ae3-4602-9395-3598923df190	tenant	t	2026-07-03 12:59:03.708	\N	0	0	2026-07-03 12:59:03.709	2026-07-03 12:59:03.709	\N	\N	\N	\N	\N
bd667102-ffed-40fd-a29e-841e0b1a2483	Jane Gonzalez	jane.gonzalez82@email.com	9876543291	\N	c375af80-892f-4f5a-aede-f9972d32bb95	owner	t	2026-07-03 12:59:03.789	\N	0	0	2026-07-03 12:59:03.79	2026-07-03 12:59:03.79	\N	\N	\N	\N	\N
a10ecfb2-e5ed-4283-8ece-3a063095bea3	Robert Wilson	robert.wilson83@email.com	9876543292	\N	0474c2be-e414-4a0d-81b6-4181fd55c27d	owner	t	2026-07-03 12:59:03.858	\N	0	0	2026-07-03 12:59:03.859	2026-07-03 12:59:03.859	\N	\N	\N	\N	\N
0f56fb51-076f-4408-b7cc-f437da102310	Mary Anderson	mary.anderson84@email.com	9876543293	\N	b086787f-410f-4ce2-b508-db5a4a8cd1bf	tenant	t	2026-07-03 12:59:03.92	\N	0	0	2026-07-03 12:59:03.921	2026-07-03 12:59:03.921	\N	\N	\N	\N	\N
687135f6-8316-443c-94a0-281051cce6a5	Michael Thomas	michael.thomas85@email.com	9876543294	\N	3d75f7f0-98ed-4db3-b2dc-763eaf6cb262	owner	t	2026-07-03 12:59:03.985	\N	0	0	2026-07-03 12:59:03.987	2026-07-03 12:59:03.987	\N	\N	\N	\N	\N
d3a6fd9d-a0b0-4b4e-a3de-4b3aaef6fdf0	David Taylor	david.taylor86@email.com	9876543295	\N	6efec2a2-d302-481d-98d9-8510e0d3c8f9	owner	t	2026-07-03 12:59:04.054	\N	0	0	2026-07-03 12:59:04.055	2026-07-03 12:59:04.055	\N	\N	\N	\N	\N
75f0f97d-8676-4045-9e26-f0c1653339bf	James Moore	james.moore87@email.com	9876543296	\N	32c46f11-5ccc-4409-9dc6-a684a240a49b	tenant	t	2026-07-03 12:59:04.118	\N	0	0	2026-07-03 12:59:04.119	2026-07-03 12:59:04.119	\N	\N	\N	\N	\N
e87dacda-b334-475e-8ad1-9c61e9adfffc	Patricia Jackson	patricia.jackson88@email.com	9876543297	\N	138828af-e053-40da-8ef9-516585732357	owner	t	2026-07-03 12:59:04.181	\N	0	0	2026-07-03 12:59:04.182	2026-07-03 12:59:04.182	\N	\N	\N	\N	\N
97d7fe2d-24ef-40c1-9bb3-33d5fb3b7ed0	Linda Smith	linda.smith89@email.com	9876543298	\N	c4695bb0-0e70-4a4b-a8c3-7c4118319b01	owner	t	2026-07-03 12:59:04.246	\N	0	0	2026-07-03 12:59:04.247	2026-07-03 12:59:04.247	\N	\N	\N	\N	\N
e7ecad30-0be5-4e7b-9427-774847901d70	Barbara Doe	barbara.doe90@email.com	9876543299	\N	77f55918-aa60-47b3-b989-49026574f9bf	tenant	t	2026-07-03 12:59:04.308	\N	0	0	2026-07-03 12:59:04.31	2026-07-03 12:59:04.31	\N	\N	\N	\N	\N
8486c53d-13c7-4e68-bae8-76f60d2bc4bd	William Johnson	william.johnson91@email.com	9876543300	\N	3e62c1d2-6958-4f94-b83f-8ef468c9f969	owner	t	2026-07-03 12:59:04.371	\N	0	0	2026-07-03 12:59:04.372	2026-07-03 12:59:04.372	\N	\N	\N	\N	\N
2b561152-ee10-4d51-bd75-855740d4a309	Elizabeth Brown	elizabeth.brown92@email.com	9876543301	\N	79fce540-20bb-42a2-91e6-287ab026c669	owner	t	2026-07-03 12:59:04.435	\N	0	0	2026-07-03 12:59:04.436	2026-07-03 12:59:04.436	\N	\N	\N	\N	\N
b69bf868-8953-48a1-a66c-7a936c89e292	Joseph Williams	joseph.williams93@email.com	9876543302	\N	4964a392-db3b-4453-8d8d-39a3394ef814	tenant	t	2026-07-03 12:59:04.5	\N	0	0	2026-07-03 12:59:04.501	2026-07-03 12:59:04.501	\N	\N	\N	\N	\N
ae539f9c-b53c-4c50-b243-a2c3ead279e0	Susan Jones	susan.jones94@email.com	9876543303	\N	fc24ebac-d6a4-4779-88bc-dd55a46e93d6	owner	t	2026-07-03 12:59:04.564	\N	0	0	2026-07-03 12:59:04.565	2026-07-03 12:59:04.565	\N	\N	\N	\N	\N
5b64b033-e513-478d-af74-efef74a66373	Thomas Garcia	thomas.garcia95@email.com	9876543304	\N	81adc3fd-a3e7-4d4f-96ef-87a80bd0af27	owner	t	2026-07-03 12:59:04.627	\N	0	0	2026-07-03 12:59:04.628	2026-07-03 12:59:04.628	\N	\N	\N	\N	\N
19fbb597-a8bf-4e52-892d-708cdea8db61	Jessica Miller	jessica.miller96@email.com	9876543305	\N	edb88c52-d244-44e8-8acb-531742bc08cb	tenant	t	2026-07-03 12:59:04.692	\N	0	0	2026-07-03 12:59:04.693	2026-07-03 12:59:04.693	\N	\N	\N	\N	\N
947a2547-7d9e-41a9-a971-302770749fa6	Sarah Davis	sarah.davis97@email.com	9876543306	\N	87b69f77-2c3a-4b3a-8dbc-304000bc3ca4	owner	t	2026-07-03 12:59:04.758	\N	0	0	2026-07-03 12:59:04.759	2026-07-03 12:59:04.759	\N	\N	\N	\N	\N
dfbef3dc-39bd-4295-86c1-f2997963f6f9	Karen Rodriguez	karen.rodriguez98@email.com	9876543307	\N	58ec8846-096c-45a9-90a1-08387f820ecb	owner	t	2026-07-03 12:59:04.824	\N	0	0	2026-07-03 12:59:04.825	2026-07-03 12:59:04.825	\N	\N	\N	\N	\N
9248b051-e9de-4c78-8862-b6a03e59cde2	Nancy Martinez	nancy.martinez99@email.com	9876543308	\N	2279692f-a6ad-416b-8ba8-2691d6264675	tenant	t	2026-07-03 12:59:04.887	\N	0	0	2026-07-03 12:59:04.888	2026-07-03 12:59:04.888	\N	\N	\N	\N	\N
c91d7e65-2178-4d8e-8847-68a619c00b84	Lisa Hernandez	lisa.hernandez100@email.com	9876543309	\N	574888af-4edb-4ec0-a571-d50afb35a245	owner	t	2026-07-03 12:59:04.952	\N	0	0	2026-07-03 12:59:04.953	2026-07-03 12:59:04.953	\N	\N	\N	\N	\N
009530ac-36c3-4170-ac72-06466c1d746e	Why this	\N	9898989885	\N	ee031c91-748a-425c-86b6-591352a460ca	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 14:38:03.59	2026-07-03 14:38:03.59	\N	\N	\N	\N	\N
d8cebe4d-c605-46d8-b26a-8488fbb49aad	ABc dfghdfghfdgfdg	\N	99999555555	\N	1e0f3f33-6be1-4225-9b4d-7dbaced4f19a	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.776	2026-07-03 15:16:04.776	\N	\N	\N	\N	\N
53b83bae-40a4-4832-bd4a-2e4384b080d3	qwqwer fghggh	\N	99999555555	\N	578871c5-0ff0-4027-a537-138184049557	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.813	2026-07-03 15:16:04.813	\N	\N	\N	\N	\N
84126467-077a-4e26-a0e2-5d3549548bbd	wqewertgb  dffgdfgdffg	\N	99999555555	\N	65edb33b-17c8-4771-9e62-2f4689bea775	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.838	2026-07-03 15:16:04.838	\N	\N	\N	\N	\N
092e27dc-4faa-47c6-a60b-a54c0af20e12	asdsff  fgdfs	\N	99999555555	\N	96e6b65b-d3c9-4d30-b3c2-c745f75e34a7	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.866	2026-07-03 15:16:04.866	\N	\N	\N	\N	\N
8c231787-0d87-40af-8de7-dde6b2b2146b	asdasd as as	\N	99999555555	\N	0b0b8ca1-7c84-40ba-90d9-0837f83ad032	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.897	2026-07-03 15:16:04.897	\N	\N	\N	\N	\N
8e05b5c2-1f95-41b2-b2a8-4344e6306911	Xyx	\N	99999555555	\N	f37e5c20-e834-4aa7-be9e-a8fbdf94e8b5	owner	t	2026-07-03 00:00:00	\N	0	0	2026-07-03 15:16:04.926	2026-07-03 15:16:04.926	\N	\N	\N	\N	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_permissions (id, "societyId", role, module, "canView", "canCreate", "canEdit", "canDelete", "canExport", "updatedBy", "updatedAt") FROM stdin;
91e0077a-65ef-4e19-a696-569586428a5d	1	sub_admin	billing	t	t	t	f	t	\N	2026-06-22 12:59:16.622
ea38d0a9-c04a-4992-a719-a2b4cc46e004	1	sub_admin	residents	t	t	t	f	t	\N	2026-06-22 12:59:16.622
7b811077-63c8-4874-bb34-bc0b81a0fecc	1	sub_admin	flats	t	t	t	f	f	\N	2026-06-22 12:59:16.622
5505e9ac-a7a9-42d7-bba9-9267336ed6ac	1	sub_admin	visitors	t	t	f	f	t	\N	2026-06-22 12:59:16.622
cb161503-cafa-4457-82b5-99355db4d1e0	1	sub_admin	notices	t	t	t	t	f	\N	2026-06-22 12:59:16.622
12ac7032-2e75-405f-a04c-bd1c7a9d6294	1	sub_admin	complaints	t	f	t	f	f	\N	2026-06-22 12:59:16.622
55eef434-1443-4d25-9fe7-319b4a90d05e	1	sub_admin	staff	t	f	f	f	f	\N	2026-06-22 12:59:16.622
b6c67c31-20d1-43cc-a729-590b3dab8161	1	sub_admin	assets	t	f	t	f	f	\N	2026-06-22 12:59:16.622
1c3e0cd2-f0ee-4896-818e-ac54f764d13a	1	sub_admin	parking	t	f	t	f	f	\N	2026-06-22 12:59:16.622
7006f933-8c6f-4d81-9c4b-b594bd1e99c2	1	sub_admin	expenses	t	t	f	f	t	\N	2026-06-22 12:59:16.622
3513cc1b-9bf3-402a-af34-af274b2281b7	1	sub_admin	income	t	t	f	f	f	\N	2026-06-22 12:59:16.622
afdb4117-1172-4afe-a11a-99acc2ec7111	1	sub_admin	invoices	t	t	f	f	f	\N	2026-06-22 12:59:16.622
05af6401-bda5-4767-a1cc-a9ed63058ff2	1	sub_admin	events	t	t	t	f	f	\N	2026-06-22 12:59:16.622
1213953c-9514-478c-b384-c29f05fcb46f	1	sub_admin	vendors	t	f	f	f	f	\N	2026-06-22 12:59:16.622
9dd30375-a35a-4047-ba3a-529849a8eaeb	1	sub_admin	committee	t	f	t	f	f	\N	2026-06-22 12:59:16.622
e8c3c467-956d-4ea6-aa55-744cb340c33c	1	sub_admin	helpers	t	t	t	f	f	\N	2026-06-22 12:59:16.622
715109df-4759-468d-ba04-7898e183cacb	1	sub_admin	reports	t	f	f	f	t	\N	2026-06-22 12:59:16.622
e9f7f227-ea5c-40b6-9ce3-73313f7c2a6e	1	sub_admin	settings	f	f	f	f	f	\N	2026-06-22 12:59:16.622
98b54b2c-37ab-4b01-afce-80c4b80cadc4	1	sub_admin	users	f	f	f	f	f	\N	2026-06-22 12:59:16.622
3b69d19e-d11d-4100-a169-de99e47b6602	1	member	billing	t	f	f	f	f	\N	2026-06-22 12:59:16.622
1fa01f33-1a2e-4adf-be0d-4e523fb44f2f	1	member	residents	t	f	f	f	f	\N	2026-06-22 12:59:16.622
e6ea3d13-005a-4a0e-bd35-f306348cd279	1	member	flats	t	f	f	f	f	\N	2026-06-22 12:59:16.622
c4f892b7-b18e-4bd0-8023-a4914f0bc7ba	1	member	visitors	t	f	f	f	f	\N	2026-06-22 12:59:16.622
033a22bf-1c18-488f-802c-cbece76622d2	1	member	notices	t	t	f	f	f	\N	2026-06-22 12:59:16.622
f5da8ceb-851b-4afe-b920-6cd4e8dff23a	1	member	complaints	t	f	f	f	f	\N	2026-06-22 12:59:16.622
7e637516-b1e5-4d9d-aca5-b6698632640c	1	member	staff	t	f	f	f	f	\N	2026-06-22 12:59:16.622
9f6e0641-ba10-4163-b546-c403f368d679	1	member	assets	t	f	f	f	f	\N	2026-06-22 12:59:16.622
cec2035a-1b6e-4687-8a46-e0f05d39ff14	1	member	parking	t	f	f	f	f	\N	2026-06-22 12:59:16.622
e53b3e63-d127-4f3b-89fd-19b76f91b3de	1	member	expenses	t	f	f	f	f	\N	2026-06-22 12:59:16.622
e4effd6e-40a9-4ff7-85af-f82354a126f7	1	member	income	t	f	f	f	f	\N	2026-06-22 12:59:16.622
b2e771d8-7706-4b9d-938c-a2a1aa2765ba	1	member	invoices	t	f	f	f	f	\N	2026-06-22 12:59:16.622
e100993c-c327-4739-bc45-261e167b760d	1	member	events	t	f	f	f	f	\N	2026-06-22 12:59:16.622
8e0a6c2e-7635-4bdd-b679-823ea15cfcdf	1	member	vendors	t	f	f	f	f	\N	2026-06-22 12:59:16.622
bab699ab-0551-4ec1-a853-445785693d36	1	member	committee	t	f	f	f	f	\N	2026-06-22 12:59:16.622
4808be56-1e53-40bb-885d-b020bf85f610	1	member	helpers	t	f	f	f	f	\N	2026-06-22 12:59:16.622
18389f13-f49d-427a-934a-d89f24f2cad3	1	member	reports	t	f	f	f	f	\N	2026-06-22 12:59:16.622
90781044-595c-48ef-a301-575a8cc4f2ea	1	member	settings	f	f	f	f	f	\N	2026-06-22 12:59:16.622
1b7a0916-5c89-4d65-91c7-387a00f4c420	1	member	users	f	f	f	f	f	\N	2026-06-22 12:59:16.622
1f3b7086-5b48-469f-beb9-f8325a3def7a	10	sub_admin	billing	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
c28edcbf-b1ca-4906-89be-96c6f21c5100	10	sub_admin	notices	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
723bdf4a-720d-4430-927e-f4588f37c37a	10	sub_admin	expenses	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
b2fa1c32-554d-4165-b101-07c11ec4583a	10	sub_admin	visitors	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
12efb54a-b6b9-4f82-8ec1-7a54a0229ba0	10	sub_admin	residents	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
670a5fd6-d1b6-4247-a72e-67801c3ecfe1	10	sub_admin	settings	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
b6299930-a6a7-40ab-ae23-1a2ecd37afe3	10	sub_admin	reports	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
c4cbfa25-d3ef-4581-bba5-5e980b3659cc	10	sub_admin	users	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
6385e23b-c8e6-4f71-b4b7-2189ada3e61c	10	sub_admin	assets	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
83cd91b3-276c-4614-851d-c10264cea293	10	sub_admin	income	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
1270ac58-18ae-4940-a7d9-2d144c84d6d5	10	sub_admin	flats	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
ed4eea29-d812-405c-93e8-1e072d705131	10	sub_admin	helpers	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
98328848-63be-4232-8a10-f2db1c4a3732	10	sub_admin	parking	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
fe4c4ccd-d587-4422-91fc-34a295e5802b	10	sub_admin	invoices	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
10eeb3e0-2b7a-47d1-bd95-a361add0d49e	10	sub_admin	committee	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
e06093cc-cb94-4f91-8491-05324ef7c505	10	sub_admin	vendors	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
10058c50-43aa-404d-91df-0314f7e2c409	10	sub_admin	staff	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
a016ef41-ebbd-4ee4-91b5-0908dfe817f2	10	sub_admin	complaints	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.965
6dfb54b5-b081-4153-b1cc-8d97c132dd04	10	sub_admin	events	t	t	t	t	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:01:58.964
f83d132a-7ab3-4f2e-9bb4-3cccc29ed0c4	10	member	billing	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.8
167d9007-9732-4924-bd52-abfad4554481	10	member	residents	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.8
920c0292-1077-4b78-ad3b-5b452a093e59	10	member	notices	t	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
8da035d4-8c67-4254-8583-b67ab37070d3	10	member	users	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
c1ac7b6e-43b7-4dc7-b5ff-11a668673e6e	10	member	reports	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
4915fe05-ecfa-4c6e-bfb8-b779590785f2	10	member	visitors	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
75302f23-bec0-4780-980d-1aa56a56fd97	10	member	settings	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
d41d9854-be08-482e-8d43-2eb78515babf	10	member	assets	t	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
978e44a6-d92d-46b9-87cc-c7af88f60cfb	10	member	committee	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
a474a216-2ed6-4788-988b-e49bb0780e1f	10	member	parking	t	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
73a56867-d3d7-43ee-9ee9-b22cf328c53a	10	member	income	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.805
70fb7a7c-00e5-4730-98a9-56394abda5a3	10	member	staff	t	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
aa5a28ea-08ba-4af7-91d2-a13dc63f3534	10	member	events	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
fbc52799-d018-49c6-b086-18329e351fbb	10	member	complaints	t	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
812259a9-b615-4a09-933e-cecd327f8544	10	member	vendors	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
e3b55594-0fd4-4d00-8a1d-236f6c3535b9	10	member	invoices	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
3b7f3c7f-4f12-4446-9b9a-87f22374cd02	10	member	flats	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.801
d44b9975-5d71-4b48-bfdf-e22bbe0f5155	10	member	helpers	f	f	f	f	f	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
67f529a0-b9ab-4453-b32b-e7587f7bfbb9	10	member	expenses	t	t	t	f	t	1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	2026-06-22 13:10:49.802
\.


--
-- Data for Name: societies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.societies (id, name, address, "registrationNumber", "contactEmail", "contactPhone", city, state, pincode, "createdAt", "updatedAt", status, "setupToken", "setupTokenExpiry", "logoUrl", "activatedAt", "societyUrl", "accountNumber") FROM stdin;
2	Test Society	\N	\N	test@testsociety.in	+91-9000000001	Pune	Maharashtra	\N	2026-06-15 14:24:57.11	2026-06-15 14:24:57.11	pending	427e21fae613661ee3deedc70ccef234e617ac297675b24106bd4d4ac952ff63	2026-06-17 14:24:57.108	\N	\N	\N	\N
3	ABC Lines Nagda	\N	\N	abc.lines@mailinator.com	9755827797	Nagda	MP	\N	2026-06-15 14:25:05.78	2026-06-15 14:25:05.78	pending	6636ac9dcde63fad352b3163cf5ab216706f4d14ecbb68ba0f77559118e6e43f	2026-06-17 14:25:05.779	\N	\N	\N	\N
4	Gautam Residency	251, Chhoti Khajrani, Near MR 9 Indore	SO/31/2025	admin.gr@mailinator.com	9755827797	Indore	Madhya Pradesh	452011	2026-06-15 14:41:09.946	2026-06-15 14:43:07.517	setup	096fa42a5fa605538fe6ea972c8acfd95ff5f13650787972af49acf82794f00c	2026-06-17 14:41:09.944	\N	\N	\N	\N
5	Dev Society5	\N	\N	dev5@test.com	9876543214	Mumbai	Maharashtra	\N	2026-06-15 15:05:29.604	2026-06-15 15:05:29.604	pending	5ec654f469eeccecadc3fb558056bcbdd55c1804b7dda3bf556846c7ec1455e2	2026-06-17 15:05:29.603	\N	\N	\N	\N
6	Dev Society6	\N	\N	dev6@test.com	9876543215	Pune	Maharashtra	\N	2026-06-15 15:06:33.423	2026-06-15 15:06:33.423	pending	89a80167f6a9bb5f66ab4257166a530fbb6dd1643d27480717dcee696171a577	2026-06-17 15:06:33.422	\N	\N	\N	\N
7	Dev Society7	\N	\N	dev7@test.com	9876543216	Delhi	Delhi	\N	2026-06-15 15:08:19.497	2026-06-15 15:08:19.497	pending	1250f1dcc310715caeb106b6e50bc0930438a666f0dc63ab98b62458d9e452f2	2026-06-17 15:08:19.496	\N	\N	\N	\N
8	Brilliant Group Soceity Indore	251, Address here	MP/2025/31	brill@mailinator.com	9755827797	Indore	Mp	452011	2026-06-16 11:59:42.428	2026-06-16 12:01:33.383	active	\N	\N	\N	2026-06-16 12:01:33.382	\N	\N
9	ABC	\N	\N	abc123@mailinator.com	9755827798	Indore	MP	\N	2026-06-16 13:08:24.929	2026-06-16 13:08:24.929	pending	57bb13a9180704f07f4f7b709256641485f6a75ce8109b83f0a7c436daaa829b	2026-06-18 13:08:24.928	\N	\N	\N	\N
11	New York City	\N	\N	nyc@mailinator.com	9755827797	Panaji	Goa	\N	2026-07-02 09:56:50.283	2026-07-02 09:56:50.283	pending	45053ddf96e6f29a2a78edbcdf178509dc869eb39fa983efc5952327012d782c	2026-07-04 09:56:50.282	\N	\N	\N	\N
12	Pink City	200, Pink City near Ring road	MP/BP/20001	pinkcity@mailinator.com	6264896147	Bhopal	Madhya Pradesh	456001	2026-07-02 10:04:20.552	2026-07-02 10:08:41.513	active	\N	\N	\N	2026-07-02 10:08:41.512	\N	\N
13	Vipin Vihar MIG	MIG Colony	MP/RE/2000123	sandy@mailinator.com	9713599998	Indore	Madhya Pradesh	452010	2026-07-02 14:35:56.131	2026-07-02 14:38:52.708	active	\N	\N	\N	2026-07-02 14:38:52.706	\N	\N
1	Green Valley Residential Society	123 Society Road, City - 400001	MH/SOC/2024/001	admin@greenvalley.in	+91-9000000000	Mumbai	Maharashtra	400001	2026-05-15 07:23:37.676	2026-05-15 07:23:37.676	active	\N	\N	\N	\N	default-society	2026011001
14	Gautam Residency Indore	251, Chhoti Khajrani, Near MR 9 Indore	MP/SR/202531	admin@gr.com	9755827797	Indore	Madhya Pradesh	452011	2026-07-10 12:21:19.7	2026-07-10 12:22:42.062	active	\N	\N	\N	2026-07-10 12:22:42.061	gautam-residency-indore	2026071001
10	alpha to delta	251, Chhoti Khajrani, Near MR 9 Indore	MP/SC/2025/31	alpha@mailinator.com	9755827797	Indore	Madhya Pradesh	452011	2026-06-16 14:50:16.172	2026-07-10 15:37:05.973	active	\N	\N	\N	2026-07-02 10:03:31.281	alpha-to-beta	2026071002
15	Adams Park Bhopal	200, Pink City near Ring road	\N	adams@mailinator.com	9755827797	Bbhopal	Madhya Pradesh	452220	2026-07-11 09:16:44.177	2026-07-11 09:18:23.742	active	\N	\N	\N	2026-07-11 09:18:23.742	adams-park	2026071003
\.


--
-- Data for Name: society_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.society_settings (id, "updatedAt", "societyId", "varName", "varValue") FROM stdin;
1240ade3-3476-4919-8f52-56b64bd23628	2026-06-15 14:25:05.785	3	bank_account_number	
5b452a68-e5a8-4c54-9a09-a36017d310e2	2026-06-15 14:25:05.785	3	require_2fa	false
207d3cc4-85f2-4e0a-8090-8f3f526a3d45	2026-06-15 14:25:05.785	3	bank_ifsc	
162d6d61-cacc-4901-b29c-a8480f8eae2c	2026-06-15 14:25:05.785	3	address	
1d5e6903-e7cf-42f5-8602-e6abdec2bdf5	2026-06-15 14:25:05.785	3	bill_vacant_flats	false
0075e2ff-2010-49ad-9262-800af3d7e75b	2026-06-15 14:25:05.785	3	late_fee_grace_days	10
5dd71812-5d23-422f-9196-eb7ea9c3d270	2026-06-15 14:41:09.951	4	require_2fa	false
1d2f42d9-693c-4a5a-b8e6-f656780a209b	2026-06-15 14:41:09.952	4	bank_ifsc	
1d561dce-e64a-441b-8013-d54639b4c8fd	2026-06-15 14:41:09.952	4	bank_account_number	
7f22366e-01ad-4a12-a802-1f20beeac09a	2026-06-15 14:41:09.952	4	upi_id	
dd18c5c6-0565-40f6-a25e-412c4bbc3551	2026-06-15 14:41:09.952	4	bank_name	
e6714d49-d464-4e9c-b7ca-44713d7fee00	2026-06-15 14:43:07.521	4	society_name	Gautam Residency
ddfe5759-4dd5-4ea0-8a88-675123c70e36	2026-06-15 14:43:07.522	4	address	251, Chhoti Khajrani, Near MR 9 Indore
4cc92a39-107d-473d-97db-32995b7df136	2026-06-15 15:05:29.62	5	rate_per_sqft	1.0
40b0fb36-d858-46fa-85be-b1b71196187b	2026-06-15 15:05:29.62	5	late_fee_grace_days	10
0a21ff0c-f5c1-4533-b785-84164826ac1e	2026-06-07 07:11:07.614	1	society_name	Green Valley Residential Society
a9a6579b-284e-4eff-84b6-b468a2303438	2026-06-07 07:11:07.614	1	address	123 Society Road, City - 400001
470398c5-83cb-4ccc-8a9c-e8a265f4f1ae	2026-06-15 15:05:29.62	5	society_name	Dev Society5
a885559d-9cf4-43e4-b5c7-48d035507c99	2026-06-09 10:25:31.672	1	bank_name	
27b31daa-2cc7-4cdf-87e3-b95c156e112c	2026-06-09 10:25:31.672	1	bank_account_number	
f30f4ef1-c2d3-4d55-a6f9-49e59ddb4ad3	2026-06-09 10:25:31.672	1	bank_ifsc	
874023fa-142b-4098-b373-1f459668899e	2026-06-09 10:25:31.672	1	bank_branch	
f39c789a-6f2b-4c2d-984e-d2037ef4fd25	2026-06-09 10:25:31.672	1	upi_id	
4674a72c-a565-420f-9b26-5e19c95eab7a	2026-06-09 10:25:31.672	1	upi_qr_code	
c5446514-c2fd-487d-99f2-ead264e5ef18	2026-06-15 15:05:29.62	5	late_fee_per_day	10.0
dd1f8c66-afd2-4db4-a8a2-a59e58f1db5a	2026-06-15 15:05:29.62	5	bill_vacant_flats	false
b0547a96-5bd3-4169-bb25-62902d8fc258	2026-06-15 15:05:29.62	5	fixed_charge	700.0
e4c1c5da-cd8f-4809-a708-1ce351d51cc0	2026-06-15 15:05:29.62	5	address	
ec9071b6-ab28-4151-8c15-6bda6ae04e1b	2026-06-15 15:05:29.62	5	require_2fa	false
a3b41c6f-3f30-4e46-93d2-b2ba26698137	2026-06-11 12:32:56.203	1	rate_per_sqft	1
165a6ec8-f698-471d-84cd-30e09576b406	2026-06-11 12:32:56.203	1	fixed_charge	700
9ae33aeb-8f8a-4242-b5d4-b41575de4b6c	2026-06-11 12:32:56.203	1	late_fee_grace_days	5
d7a43aeb-2c5a-4667-8de4-7327a078e127	2026-06-11 12:32:56.203	1	late_fee_per_day	10
clbillvacant000000000000001	2026-06-11 12:32:56.203	1	bill_vacant_flats	true
bfbc54ab-b26e-437c-a3ea-03160fff5618	2026-06-13 10:18:49.811	1	require_2fa	false
20425c84-32c0-4114-b882-04a5f920f49e	2026-06-15 14:24:57.126	2	rate_per_sqft	1.0
ba9ee4ca-2324-43b0-847f-c4bcaf852a10	2026-06-15 14:24:57.126	2	society_name	Test Society
ba36f0a4-cd66-4a02-bc15-e0f9b6e6894f	2026-06-15 14:24:57.127	2	bank_account_number	
76c01ff0-1762-4410-aba5-767c3026da05	2026-06-15 14:24:57.126	2	fixed_charge	700.0
70558a8b-8dd9-4070-bf71-897cfc0c6e75	2026-06-15 14:24:57.126	2	late_fee_per_day	10.0
181ec00c-9f2e-409e-b9b3-8b5128ff349a	2026-06-15 14:24:57.127	2	require_2fa	false
28161c9f-b0d4-4025-a521-928ab5226a8a	2026-06-15 14:24:57.127	2	upi_id	
664aa4e8-8ce6-455c-a31a-02fe457fdc7a	2026-06-15 14:24:57.126	2	address	
b34b29ef-3301-4961-b961-a223215d3f45	2026-06-15 14:24:57.127	2	bank_name	
1403a8d3-77a9-473a-acc0-16b159636b9f	2026-06-15 14:24:57.127	2	bank_ifsc	
0366ba2d-e2f2-4999-8b56-7d16183f02b2	2026-06-15 14:24:57.126	2	late_fee_grace_days	10
5fc3193d-87c0-40fe-aefa-a1b54cfbf45c	2026-06-15 14:24:57.126	2	bill_vacant_flats	false
ca4c2452-d2c0-48a6-9938-1b4e33fc8269	2026-06-15 14:25:05.785	3	upi_id	
ae852a97-737a-40ad-aff9-410c73c78578	2026-06-15 14:25:05.785	3	fixed_charge	700.0
8a37082f-dd24-46cc-a4f8-32066a69a6ba	2026-06-15 14:25:05.785	3	late_fee_per_day	10.0
7a09a616-fb3c-450f-bad7-a02f7952c61b	2026-06-15 14:25:05.785	3	bank_name	
aedd2d39-3861-4e96-acb1-c4d18733a451	2026-06-15 14:25:05.785	3	society_name	ABC Lines Nagda
fa0d299f-6c44-42d9-87b5-1b2d6206f5e1	2026-06-15 14:25:05.785	3	rate_per_sqft	1.0
3e4f8533-c958-4a91-aa3e-d6946a1bc1b5	2026-06-15 15:05:29.62	5	bank_name	
2326db94-b77b-4b8d-ad28-2017fb589d59	2026-06-15 15:05:29.62	5	upi_id	
ea92382d-80a8-42d3-b9dd-3ef049e765be	2026-06-15 15:05:29.62	5	bank_ifsc	
e3eafe74-43b6-4a99-a9cb-e3afe1baa832	2026-06-15 15:05:29.62	5	bank_account_number	
72e1a520-6dcf-4d3b-aaa1-c80e7dae6694	2026-06-15 15:06:33.432	6	require_2fa	false
167d1ad6-d058-4cf7-a287-4f3c992135ae	2026-06-15 15:06:33.432	6	upi_id	
494faa49-fd28-414f-9d46-6a1e075dce01	2026-06-15 15:06:33.432	6	bank_account_number	
f5d274eb-b737-4f5d-a083-dbb0c0e20a80	2026-06-15 15:06:33.432	6	bill_vacant_flats	false
75210bbe-46d1-48e7-a0c4-3dc3b445dedc	2026-06-15 15:06:33.432	6	address	
5b5e886a-4465-4168-bfca-0d56b753c0a9	2026-06-15 15:06:33.432	6	bank_name	
ca1e61d8-fce7-42a9-b1e4-f05b614b2f18	2026-06-15 15:06:33.432	6	bank_ifsc	
230c5f8d-6b84-439b-be5f-68544c3ca434	2026-06-15 15:06:33.433	6	late_fee_per_day	10.0
70154f8b-e9cb-409c-a51b-da380631d432	2026-06-15 15:06:33.432	6	late_fee_grace_days	10
90a601ca-713c-443d-91ba-2cb4c71689a5	2026-06-15 15:06:33.432	6	rate_per_sqft	1.0
cac1201f-06a9-4a82-91b7-b586f5656458	2026-06-15 15:06:33.432	6	society_name	Dev Society6
0efb3dce-ebd0-4ff5-b81d-282493aeb2dc	2026-06-15 15:06:33.432	6	fixed_charge	700.0
ddac76f0-824b-4054-b66f-b649bdb572a7	2026-06-15 15:08:19.505	7	rate_per_sqft	1.0
7a66aa7d-230e-445d-9d63-0f7e02dff230	2026-06-15 15:08:19.505	7	fixed_charge	700.0
2e142e24-e981-446c-9b9e-f31b0733098f	2026-06-15 15:08:19.505	7	late_fee_per_day	10.0
5030021a-d563-4414-9b95-e8c8571f4129	2026-06-15 15:08:19.505	7	address	
cf1778ed-1996-43db-ba81-2478feb8dc68	2026-06-15 15:08:19.506	7	upi_id	
a70bbe9c-86b2-45c9-a595-f2adf7ff62c9	2026-06-15 15:08:19.505	7	late_fee_grace_days	10
7cb4d855-e5aa-466b-b0d0-cab69f741a02	2026-06-15 15:08:19.505	7	require_2fa	false
fbd122ce-2e6b-4aa3-b4e8-4c8bd2c8accf	2026-06-15 15:08:19.505	7	society_name	Dev Society7
4f7ec390-8633-49e3-ad8d-a3f63da48f1c	2026-06-15 15:08:19.505	7	bank_name	
f6e985d5-55a0-48ff-a423-7fb100e7e83e	2026-06-15 15:08:19.506	7	bank_ifsc	
21882ffa-e4ac-4575-b0cd-c6fea2c221e7	2026-06-15 15:08:19.506	7	bill_vacant_flats	false
6a86ce31-bb39-4588-820b-cbc948615053	2026-06-15 15:08:19.506	7	bank_account_number	
587665a2-c24f-4921-b05d-9b2417cd88d0	2026-06-15 15:55:23.38	4	fixed_charge	500
0e42a9ca-fa12-44cd-9ab3-c097fbcef890	2026-06-15 15:55:23.38	4	bill_vacant_flats	true
7d5baa74-2465-4385-9547-49859188b202	2026-06-15 15:55:23.38	4	late_fee_grace_days	10
06839639-8c2b-4b26-8baa-772bc5d05ddc	2026-06-15 15:55:23.38	4	late_fee_per_day	10
3414f6f1-52ba-4e2d-a9af-94fad5399ead	2026-06-15 15:55:23.38	4	rate_per_sqft	1.5
9b07effc-b76b-4ed3-b312-c8d94f2b0542	2026-06-16 09:28:32.537	4	pagination_limit	25
98e3aa8b-150a-4cf0-b5c2-5d72f3c2d2c0	2026-06-16 09:28:32.537	4	theme	light
ac21b39c-bede-4a82-83ca-0a5ab24de3d0	2026-06-16 11:59:42.436	8	rate_per_sqft	1.0
fc172ba0-d4e7-4787-8d3a-63ea7e63595b	2026-06-16 11:59:42.437	8	late_fee_grace_days	10
364ffb55-34ff-4bcc-9df4-74e72f805237	2026-06-16 11:59:42.436	8	fixed_charge	700.0
16f5df54-910b-4827-ac42-7f1311ebe189	2026-06-16 11:59:42.437	8	upi_id	
80a4eb4a-f51d-4d02-af3a-e9d72f80d743	2026-06-16 11:59:42.437	8	require_2fa	false
f97a688d-f6ac-4efc-8e98-a43645a615b1	2026-06-16 11:59:42.437	8	bank_name	
cba3ab3d-64a2-4b88-a59c-63bcab457417	2026-06-16 11:59:42.437	8	bank_account_number	
fc1bd903-c1ac-43ba-83f2-d8ea37d79a7b	2026-06-16 11:59:42.437	8	bank_ifsc	
737b3e7f-6f23-46fa-b21b-6043915a91da	2026-06-16 11:59:42.437	8	bill_vacant_flats	false
cec00518-bbdd-466d-92a0-183ed07da074	2026-06-16 11:59:42.437	8	late_fee_per_day	10.0
2aa0c2e1-a00e-4e7f-a088-cac540b9c276	2026-06-16 12:00:45.926	8	society_name	Brilliant Group Soceity Indore
2fb98a8c-dfd5-4f2d-a834-55554c005171	2026-06-16 12:00:45.926	8	address	251, Address here
9cf16fa7-d694-41ce-9afc-e0a1fd9e84c2	2026-06-16 13:08:24.935	9	rate_per_sqft	1.0
5391f176-9be1-4437-9554-39aea6f195fd	2026-06-16 13:08:24.935	9	society_name	ABC
b2ff7291-df91-4b9e-96c1-31f5023e3268	2026-06-16 13:08:24.935	9	late_fee_grace_days	10
ef914a4b-29bb-449a-ba38-723a7984b00c	2026-06-16 13:08:24.935	9	bill_vacant_flats	false
c438fe8e-65cc-4765-8770-52d871a3bda9	2026-06-16 13:08:24.935	9	upi_id	
186e03f6-2d1e-4817-9487-a20ba216beac	2026-06-16 13:08:24.935	9	bank_account_number	
8dcbf491-6eb4-4975-8ad0-5b428cd8084d	2026-06-16 13:08:24.935	9	require_2fa	false
c940c5f0-f971-4b68-8605-eccac292f894	2026-06-16 13:08:24.935	9	fixed_charge	700.0
81328ba3-5d00-4316-8faf-54676953c258	2026-06-16 13:08:24.935	9	bank_ifsc	
b94f8b16-2298-4e89-9b70-640253cf6640	2026-06-16 13:08:24.935	9	address	
2e418185-83d7-4c74-92c2-d3287821607b	2026-06-16 13:08:24.935	9	late_fee_per_day	10.0
cfff6500-4c90-4236-8379-eb04c3bb06b5	2026-06-16 13:08:24.935	9	bank_name	
58265dd7-b871-4d32-9efc-6ac66389025c	2026-06-16 14:50:16.18	10	bank_name	
c4d997e1-df10-4676-a3fa-b2d4913aff3f	2026-06-16 14:50:16.18	10	upi_id	
88b0bf41-a981-4698-9b71-ca02db3ed45f	2026-06-16 14:50:16.18	10	require_2fa	false
aaca3856-51f0-4255-9b45-8a4b9187f3c4	2026-06-16 14:50:16.18	10	bank_account_number	
0cbc6343-c115-4609-b4f1-0f592fb07dc9	2026-06-16 14:50:16.18	10	bank_ifsc	
7e584004-78fd-47e1-a01c-da6725779449	2026-07-10 15:37:05.979	10	society_name	alpha to delta
daae563f-4c7f-4f9d-9a29-7d39a0663b8e	2026-07-10 15:37:05.979	10	address	251, Chhoti Khajrani, Near MR 9 Indore
23453739-faae-46d3-9ebd-96b408ffb16e	2026-07-02 09:56:50.294	11	rate_per_sqft	1.0
57283817-84dd-4365-acf7-b0154187cd22	2026-07-02 09:56:50.294	11	fixed_charge	700.0
1194ba69-b123-4192-b897-ebe52e236598	2026-07-02 09:56:50.295	11	upi_id	
0c2a133c-8bcc-4acd-9653-1beafaadb2ea	2026-07-02 09:56:50.294	11	late_fee_grace_days	10
ed7fec63-cac5-4dee-9ade-664e1a472744	2026-07-02 09:56:50.294	11	bill_vacant_flats	false
b91fda3b-50e1-4a7c-907d-88a45a9741d0	2026-07-02 09:56:50.295	11	bank_account_number	
e7fa45db-687e-4144-a091-c86f10fcac86	2026-07-02 09:56:50.294	11	late_fee_per_day	10.0
255a102b-4149-4f1d-993f-8ac34939d8c8	2026-07-02 09:56:50.294	11	require_2fa	false
cf1450fe-2fa0-4b71-934d-e98c62408a81	2026-07-02 09:56:50.294	11	address	
9c71007a-2cab-486f-8894-d09570ca4e21	2026-07-02 09:56:50.294	11	society_name	New York City
4d835b46-0db7-461f-bfde-10eaba12e132	2026-07-02 09:56:50.295	11	bank_ifsc	
0c82d011-3bbe-4190-947f-0bba8425f45e	2026-07-02 09:56:50.294	11	bank_name	
1552daa4-3267-42b5-9482-c8aeca7f45a9	2026-07-02 10:04:20.556	12	require_2fa	false
f660c3aa-b4b5-4682-ad12-d1963ef22f25	2026-07-10 14:46:16.47	10	rate_per_sqft	2
b34d3aa1-c6ab-4210-80d1-0fb42b11b8ff	2026-07-10 14:46:16.47	10	fixed_charge	0
945c2c5a-5536-4a48-85c7-a9b7649f659a	2026-07-10 14:46:16.47	10	late_fee_grace_days	10
6e96cef5-c101-4af9-a990-bed707f8c8a2	2026-07-10 14:46:16.47	10	late_fee_per_day	10
f91930fb-3568-4de4-b37d-7660f2321a7f	2026-07-10 14:46:16.47	10	bill_vacant_flats	true
4065f2a1-4d76-42c2-bcd7-fcaec1664efc	2026-07-02 10:04:54.501	12	address	200, Pink City near Ring road
a08c25d3-de1d-47a7-894f-c75442d2b286	2026-07-02 10:04:54.5	12	society_name	Pink City
25d226a8-aceb-499f-bb21-14c13a0cbbbf	2026-07-02 10:06:02.555	12	late_fee_per_day	10
2504e856-d174-4025-aa2e-016d3637886c	2026-07-02 10:04:20.556	12	bank_name	
ce7460ef-4f7c-47cb-99f4-038b1665b83a	2026-07-02 10:06:02.555	12	fixed_charge	0
e58f1bdb-450e-4c4a-8661-5ead570e1233	2026-07-02 10:04:20.556	12	bank_account_number	
80930ae6-75c0-4833-b793-fdccb08ef0ff	2026-07-02 10:06:02.555	12	bill_vacant_flats	true
897c4ec2-cd76-4e3d-97e8-0f8ef777beb6	2026-07-02 10:04:20.556	12	bank_ifsc	
5280e4cc-5c5d-42e4-a7a1-558ba6470508	2026-07-02 10:06:02.555	12	rate_per_sqft	2.25
ede59c68-0ebb-489d-88ba-4d6aa2dae73c	2026-07-02 10:06:02.555	12	late_fee_grace_days	10
77b6d48e-29f5-4283-a550-b542c55dd871	2026-07-10 12:22:09.977	14	rate_per_sqft	1
01365eb5-3294-43ae-bed3-c4ed6bf98d4b	2026-07-11 09:17:28.613	15	late_fee_per_day	10
cf0072d2-2c91-481d-97d9-1a1df7e85755	2026-07-02 14:35:56.15	13	bank_name	
6f7342ca-bf09-4410-bcb3-830dd50eefff	2026-07-02 14:36:19.94	13	address	MIG Colony
1e86bb19-c64a-442a-a345-0fdde497d0f5	2026-07-02 14:37:21.49	13	rate_per_sqft	0
4a9ee6f6-e724-4501-aefd-c44230e9675c	2026-07-02 14:37:21.491	13	late_fee_per_day	10
dc21e973-bc7f-4335-baa1-7b984b848697	2026-07-02 14:37:21.49	13	late_fee_grace_days	10
31973cd9-2f79-409f-b70a-6f8323ecb4f6	2026-07-10 12:22:09.977	14	fixed_charge	700
08cbc3f2-8523-4d4b-b116-503afe58f542	2026-07-11 09:16:44.185	15	bank_name	
cc2cdc89-bb7f-4433-a8ae-40cf36fcae67	2026-07-02 14:35:56.149	13	require_2fa	false
0f969b48-388d-42e6-97f8-8dad37c92b17	2026-07-02 14:37:21.491	13	bill_vacant_flats	true
fa0682f2-6602-4204-9bec-57a3b8db525b	2026-07-10 12:22:09.978	14	late_fee_grace_days	10
4156aceb-2491-4feb-8193-68a9962d2227	2026-07-11 09:16:55.215	15	address	200, Pink City near Ring road
ed63adfb-0537-47c6-9490-4a0d90593739	2026-07-02 14:35:56.15	13	upi_id	
030cc185-2a65-4dcd-9aad-f4b13172cb7f	2026-07-10 12:22:09.977	14	late_fee_per_day	10
6c2ddf17-60c7-4899-a188-65c7a24e2bed	2026-07-11 09:17:28.612	15	late_fee_grace_days	10
f1a38cbe-12c4-451d-a243-2ae53e508364	2026-07-02 14:37:21.49	13	fixed_charge	500
e9a64dea-1412-4399-b0b3-865100f18fe2	2026-07-10 12:22:09.977	14	bill_vacant_flats	true
d11c7bf3-82e8-48d6-a709-15a659371be7	2026-07-11 09:17:28.613	15	bill_vacant_flats	true
83ea7995-37eb-4b7c-81a8-fb0dd0ec9c8d	2026-07-02 14:35:56.15	13	bank_account_number	
8a9a748e-e098-4868-9b22-767dfea7a542	2026-07-10 12:21:19.707	14	upi_id	
2e4cb75e-a587-4cc5-addc-6796a95ee601	2026-07-11 09:17:28.612	15	rate_per_sqft	1.5
1287b270-4d70-4b0b-a369-8f77226dfadb	2026-07-02 14:36:19.94	13	society_name	Vipin Vihar MIG
d59b7f7a-7ece-4ce9-9c84-9e3c7188d6c1	2026-07-10 12:21:19.707	14	bank_ifsc	
94e7b313-8bde-4378-b659-35ceb9655724	2026-07-11 09:17:28.612	15	fixed_charge	500
72f7356c-58cb-4b0c-a167-46c71b88d280	2026-07-02 14:35:56.15	13	bank_ifsc	
51052e28-6eb4-4114-bfcb-658696e925e0	2026-07-10 12:21:40.823	14	society_name	Gautam Residency Indore
5dd0b128-09e0-49cc-8381-d0169aefee39	2026-07-11 09:16:44.185	15	require_2fa	false
ece725fe-f994-4742-9dad-9568bf121fab	2026-07-10 12:21:19.707	14	bank_name	
901d0542-b4f2-4a43-81fd-d0679e793e90	2026-07-11 09:16:44.185	15	bank_ifsc	
fc582179-8a34-465d-8333-827b7ba8f3c1	2026-07-10 12:21:19.707	14	bank_account_number	
46a1bfd3-d2ad-45dc-9f7c-76bcbda1d7bd	2026-07-11 09:16:55.215	15	society_name	Adams Park Bhopal
37952a93-ef1c-4610-ad63-f5e0986a1dc5	2026-07-10 12:21:40.823	14	address	251, Chhoti Khajrani, Near MR 9 Indore
c4df889f-0b02-4358-86b3-330e08f7d562	2026-07-11 09:16:44.185	15	bank_account_number	
04992d79-4fb0-451d-a1aa-20f05d850fcf	2026-07-10 12:21:19.707	14	require_2fa	false
94d018e8-08aa-413a-995d-887c764c14df	2026-07-11 09:16:44.185	15	upi_id	
7edc8a53-5318-48d8-b318-df72ef12ee83	2026-07-10 15:37:05.979	10	phone	
30c15c64-1a32-4408-a433-1ba7272d01e4	2026-07-10 15:37:05.979	10	whatsapp	
03406904-131b-4ae4-ba65-656e1556f246	2026-07-10 15:37:05.979	10	email	
03841a1c-d97c-42cc-93b8-8474db7f8f39	2026-07-10 15:37:05.979	10	website_url	
9a488b96-c287-468e-b491-f4b225ef3f4e	2026-07-10 15:37:05.979	10	map_lat	
6922ea29-c024-4c9d-af71-4c90388e8bb8	2026-07-10 15:37:05.979	10	map_lng	
fc864e34-8637-4d68-9e6d-73fd8db6f341	2026-07-10 15:43:48.752	10	pagination_limit	25
815d55f9-e385-4c86-8f42-87fc814c5815	2026-07-10 15:43:48.752	10	theme	light
c9724167-0a1b-48fd-8611-9b0c75921f6a	2026-07-02 10:04:20.556	12	upi_id	
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.staff (id, name, role, phone, shift, "joinDate", "isActive", "createdAt", "updatedAt", "societyId") FROM stdin;
89d03c4f-ccbe-4efc-8f20-6472a45bdce2	ABC	security_guard	9999555522	morning	2026-06-03 12:13:26.666	t	2026-06-03 12:13:26.668	2026-06-03 12:13:26.668	1
bb1d2b1c-ce2d-44f7-b518-3f6da1ec3e59	Ramesh Guard	security_guard	9111111111	morning	2026-06-05 08:19:55.588	t	2026-06-05 08:19:55.588	2026-06-05 08:19:55.588	1
07ff75da-baec-45ab-b72c-49fd2e45fdf4	Sweeper	cleaner		morning	2026-06-10 14:52:48.647	t	2026-06-10 14:52:48.648	2026-06-10 14:52:48.648	1
5457f5b7-2412-4861-af1c-c15e7e525505	Cleaner	cleaner		morning	2026-06-10 14:52:57.733	t	2026-06-10 14:52:57.734	2026-06-10 14:52:57.734	1
\.


--
-- Data for Name: totp_secrets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.totp_secrets ("userId", secret, "isEnabled", "backupCodes") FROM stdin;
\.


--
-- Data for Name: user_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notes (id, "userId", "societyId", title, content, color, "isPinned", "isPublic", "createdAt", "updatedAt") FROM stdin;
a5bdca2d-9134-4005-8319-5ebc0548d316	4a82256a-dc45-4ad9-bf5b-237025101ec8	1	electricity contact	Test	yellow	f	t	2026-06-10 06:35:36.437	2026-06-10 06:36:08.529
f0debc88-ace4-46f0-8471-d13f29ee07d6	4a82256a-dc45-4ad9-bf5b-237025101ec8	1	Test	test	blue	f	t	2026-06-10 06:35:48.185	2026-06-10 09:24:37.125
b4f9c6f8-fc29-469e-9829-6853f51e1998	4a82256a-dc45-4ad9-bf5b-237025101ec8	1	Pink City	pink_city_admin\nPink@123	yellow	f	f	2026-07-02 13:13:08.181	2026-07-02 13:13:08.181
b6ebe580-a328-4296-b9d1-d19ee80b6554	4a82256a-dc45-4ad9-bf5b-237025101ec8	1	Alpha Admin	alpha_admin\nAdmin@123	yellow	f	f	2026-07-02 13:13:23.161	2026-07-02 13:13:23.161
774e689b-3bae-4211-9224-84fd6524877c	2e35e707-3cd2-4639-82a1-52090cde4638	13	Al	AI gene	yellow	f	f	2026-07-02 14:46:34.98	2026-07-02 14:46:34.98
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, "passwordHash", role, "residentId", "staffId", "isActive", "createdAt", "updatedAt", "societyId") FROM stdin;
4a82256a-dc45-4ad9-bf5b-237025101ec8	admin	$2a$10$5IQSeP2zH27n8/ASbo2KJeyyoOcOTpLOjdbfyMi2hx0TDdrP7S3h2	admin	\N	\N	t	2026-05-15 07:23:37.765	2026-05-15 07:23:37.765	1
62678121-1626-4637-89c3-54153e164523	rajesh	$2a$10$K2GEMlrDEuC2d.v8s2eEJuHkog7UzDY.wbyPw4Dfwt7NMfqQt/Fra	owner	244152f9-4cad-4ffe-bb78-7034547a12f5	\N	t	2026-06-05 08:19:55.471	2026-06-05 08:19:55.471	1
4d3a63ed-802e-4018-bc31-ba2b1ca300f2	guard1	$2a$10$2PfwcQiX10cRwz5AHhbF9uvk.5mkci3ay0aUooayODCDH4KLFvO9m	security	\N	bb1d2b1c-ce2d-44f7-b518-3f6da1ec3e59	t	2026-06-05 08:19:55.644	2026-06-05 08:19:55.644	1
8ff3c9e6-876a-493e-b839-137710e85d91	9755827797	$2a$10$Wl/EahtqUS7DUWdJdbJ3JuzO5.PXYhA2VODJQCal7xhoj6yJbXprm	admin	\N	\N	t	2026-06-15 14:45:57.064	2026-06-15 14:45:57.064	4
866508ac-cc16-4a4d-a561-2cbae4efdb23	brill_admin	$2a$10$ybZBA4cnCYgrZJjfiTdgCezqTaGorRzX5dSoT/..ruNLAwoB5Wxoy	admin	\N	\N	t	2026-06-16 12:01:16.493	2026-06-16 12:01:16.493	8
1dbdcb8f-d6c5-452c-8d82-dab7a3e66646	alpha_admin	$2a$10$y0KfiXI39rHBICZYOmpLnuF/D3dxcBiLFvcGfmu9PDsRgeL6CxpTG	admin	\N	\N	t	2026-06-16 14:50:58.816	2026-06-16 14:50:58.816	10
e9af40cf-60c3-4531-8a1b-1aedc66bda5a	dilip27	$2a$10$8yFpuyXmTF5e/0c/ID74dOhYbj8pSzNqkOer2OIAgKGA7DZMTU8qu	owner	3cdfdb5b-d836-442e-8617-bffcb46bc000	\N	t	2026-07-01 15:56:42.257	2026-07-01 15:56:42.257	10
5e529bb8-2137-47cf-88d4-455a57445a68	pink_city_admin	$2a$10$UVMkQb9tlFtYUqGJlUvKmeW6kjAvSW9tNO2Nrz1qYx/1eEOEI8jVu	admin	\N	\N	t	2026-07-02 10:05:43.357	2026-07-02 10:05:43.357	12
4056e271-732f-4e5c-b4a0-7e90619c1024	adams	$2a$10$nneHLQlTBZeanUg5cse8seMOxykKqKn1HutjRLcbeHZEp13lwLyFC	owner	961ed236-315f-4b57-9623-b38019546799	\N	t	2026-07-02 13:22:22.97	2026-07-02 13:22:22.97	12
2e35e707-3cd2-4639-82a1-52090cde4638	vipin_vihar_admin	$2a$10$KhMUsJ.cbB2fVpF0HaSveevQvA0RvUJyglkW6rRIXtzFSgkQ6hYfS	admin	\N	\N	t	2026-07-02 14:36:44.524	2026-07-02 14:36:44.524	13
cbfb4b3e-5eaf-44e6-946a-eca89f726863	john.smith	$2a$10$dx3W5Fdrg2UtUNgynMEPAuIe4k1xWdT/pUmWVhKGbiwipqAvTy9zC	owner	791e821a-9f19-4d9d-8517-b934d53b8de2	\N	t	2026-07-03 12:58:58.297	2026-07-03 12:58:58.297	12
d4613dc1-cdae-407d-9a60-1bebc9dd1036	jane.garcia2	$2a$10$cgssaqnpfAsmyaJ5OWmmaeH2JKhGhkguXeej89kAV8.IiV7ZKGdDy	owner	7c8b30fc-9297-438d-bc9c-60472614ff3f	\N	t	2026-07-03 12:58:58.377	2026-07-03 12:58:58.377	12
a0be50f0-80cd-4810-ab43-3363a504ce19	robert.rodriguez3	$2a$10$peHX4Jga3w5EaHbzBh0mh.H/Wd43FJ./M8XwZ3Wa2PkLdik.MLZJC	tenant	1bcfa1f3-12c9-4a53-a0bd-88bca7c1b21d	\N	t	2026-07-03 12:58:58.452	2026-07-03 12:58:58.452	12
47ebe8ed-b5ac-4df2-96e5-91bedb58a71e	mary.lopez4	$2a$10$S1t4PeR/Tv7mohSvVhqt8O/vnZ9ODQ3bq3oFicALKIW43ipraAlay	owner	9c1e402b-33b3-419c-8789-3807c89a3164	\N	t	2026-07-03 12:58:58.521	2026-07-03 12:58:58.521	12
2b3d1a13-ad01-4115-977a-af7cefea079b	michael.anderson5	$2a$10$b/x9YMAuI4eyvACzW7PKk.pNKNfGXEoeduwO6JJeUhNBEbkqDncii	owner	7db9d9e5-995b-4cc1-8e76-36aa92214583	\N	t	2026-07-03 12:58:58.59	2026-07-03 12:58:58.59	12
18398ce8-8a74-4de0-afb8-da7603f76d08	david.moore6	$2a$10$dTVAlWnh7b6GIjvkuNyplexWunkVduIlYfYVGcb23/KD3sqeRweqe	tenant	3830ab01-d222-4a92-aad1-b5b4d7d5534f	\N	t	2026-07-03 12:58:58.663	2026-07-03 12:58:58.663	12
368bbc4b-777e-4ea0-8f76-89a6d151052a	james.doe7	$2a$10$8ROhq..b9ansgfkh/dVv2u44w/DGYhbGq4OBJQlzrzMSno3mWBJx2	owner	781e05f5-111b-444a-b8d8-8534d3e6ae0d	\N	t	2026-07-03 12:58:58.728	2026-07-03 12:58:58.728	12
ca488f21-81a6-4094-8859-c49bb7b04910	patricia.williams8	$2a$10$eoun7.SieyojCz784.zCS.5V3jazNMOlUofs5.KYz1qM2h3A0YVdu	owner	6b13220d-08d7-4310-a3af-87c2f77a5cfa	\N	t	2026-07-03 12:58:58.794	2026-07-03 12:58:58.794	12
d4b1f3c8-1808-4feb-919b-8a4915845c04	linda.miller9	$2a$10$E638qy3e2UKdn8ULc3iXh.YD3Onakvw4F9nqRJUpupzR48hbWN8Xy	tenant	0a9881c2-8f3c-44d6-ac8e-94e400da8aa8	\N	t	2026-07-03 12:58:58.861	2026-07-03 12:58:58.861	12
9618de14-d4db-4c51-bbda-fb7ba08a9f21	barbara.martinez10	$2a$10$7O6DHhW0epll.pOhyKZ9yuyFOSvC0HxSmhyYlZvWpmy.GoFwOG3nG	owner	d8dffa87-aab4-4e22-8155-3fa91111710d	\N	t	2026-07-03 12:58:58.929	2026-07-03 12:58:58.929	12
22cf7dfd-57fe-4f5b-972d-f633eb911ddb	william.gonzalez11	$2a$10$lzIsr6TOkWeA.mxOeNGEgeebMt6.fXSEI9PqteiIhdvTMsoA3OOne	owner	89ae359a-6cc3-4b48-a751-c8c219635a38	\N	t	2026-07-03 12:58:58.995	2026-07-03 12:58:58.995	12
f2d57bd9-b7ab-4431-bf2c-e5da33a20bcd	elizabeth.thomas12	$2a$10$exZz2EqgMJxZmp7Vo8Irr.Y/69BpiZTz8YEnaEpA0ZIPo.d..SEFC	tenant	838322d4-70d7-4151-9351-7356eb92ccfc	\N	t	2026-07-03 12:58:59.061	2026-07-03 12:58:59.061	12
a93cce7b-d7c6-43fc-8d55-f1e52413a819	joseph.jackson13	$2a$10$JW9didgVeKk7iUq6f5DTROkMVaooy2U2M35QlHgWCD0upMh2tpRhG	owner	a3972027-a8b9-4196-8f2c-c9238d4af557	\N	t	2026-07-03 12:58:59.126	2026-07-03 12:58:59.126	12
fcbf2064-6f9e-41d6-94ac-58bf542e3445	susan.johnson14	$2a$10$WOCA9SiGDMyIxbwRrBYlJ.bCrXpIK2VIqgsXeM6QhgxgBWErVFLry	owner	86be879a-cf6c-4618-8a1e-980e22e206e8	\N	t	2026-07-03 12:58:59.192	2026-07-03 12:58:59.192	12
7d62402f-97ca-4962-b4ec-b5d2acfc68a6	thomas.jones15	$2a$10$AjNdCC1elJxG1JiGH4RDsOVSDGIIZQNZwfLs./6onDaJVWTtJ.0NO	tenant	b511cb9f-c687-4065-9586-053b7b028ed9	\N	t	2026-07-03 12:58:59.259	2026-07-03 12:58:59.259	12
af80ab62-d255-4b9d-bf6a-dcdb671dc6b4	jessica.davis16	$2a$10$aVYa/7lHQo7a41UfYznzG.X.uUz00N.ENZapU3.FQcZAmpXADG32S	owner	a1950098-b069-4fb1-b062-7d15fa59574b	\N	t	2026-07-03 12:58:59.325	2026-07-03 12:58:59.325	12
d4c4b12d-2fad-4225-a6f3-b7da8d27df6c	sarah.hernandez17	$2a$10$zq.7tqAa0YT2UkgkAA0Ue.pJms9qPCJ5nFekUJPGnV.koCVCNX6HC	owner	77eb0beb-9225-43b4-9a44-b6d5791d63de	\N	t	2026-07-03 12:58:59.39	2026-07-03 12:58:59.39	12
f7fbcc74-5d9d-4a73-bee8-802306665002	karen.wilson18	$2a$10$gwxCt22Ac27E/EAPjFDFP.gTbv8wEmfvmiX2EhYEBruXE1ngJdPYa	tenant	15d2fb4f-26c2-4ab6-b408-1831c943d6e6	\N	t	2026-07-03 12:58:59.457	2026-07-03 12:58:59.457	12
feae1686-9b8c-4339-bb55-8b3dcfd41c21	nancy.taylor19	$2a$10$niACSX7o2v3RVrdJ26mTaeh/ykaNuW6Gerv1d5VMO4sExFuRNFS3i	owner	2512106a-e376-4129-89e9-ff7b1f540b23	\N	t	2026-07-03 12:58:59.524	2026-07-03 12:58:59.524	12
cb556133-9c54-4626-8757-627a4ed7d8b7	lisa.smith20	$2a$10$6Kn8V4P29cTGpx9bTWz6DOE3aKnpIe1JbQ6Q34.gGkF6JfGxnC2Ai	owner	89f66b63-7f7f-4538-801c-4fedde64bfae	\N	t	2026-07-03 12:58:59.591	2026-07-03 12:58:59.591	12
3e8f37c4-4847-4107-babb-b0138c6bf467	john.brown21	$2a$10$zQQCFE8DvTD6xFmAPYGBW.QwTEQgPSX33DwNrnVcwtKK6d3yxDvD.	tenant	db39c560-e4a9-43b9-b28f-583fcb0ae726	\N	t	2026-07-03 12:58:59.659	2026-07-03 12:58:59.659	12
01a14079-8165-45e1-9f69-6fc03ccf3fb9	jane.hernandez22	$2a$10$kp9CS9rRz9zJFYE9XxvuGOsnw/W0ep6ZzSjbwLvsQu1vfRyHzjvNq	owner	9dc6769b-16e0-4fb6-ab23-9db89d95a3a2	\N	t	2026-07-03 12:58:59.727	2026-07-03 12:58:59.727	12
40be3bb8-659a-4c08-b9f2-2a55b2734466	robert.wilson23	$2a$10$IATI38LuAVOjpYP6bH4zGu6pbDadvuCvuvH/cbTpEq0igxSh1IIyW	owner	fb3d8fc4-9e68-480a-bcd9-16f07d6323df	\N	t	2026-07-03 12:58:59.792	2026-07-03 12:58:59.792	12
1adab13a-c6ae-4a3f-ab1b-de4f89ab13de	mary.taylor24	$2a$10$XX6pTYib6c6c/MK0.c9L5eXgxiZBtyGb2gELhnH1XGgU9W2ukyOYW	tenant	dc4c78fc-f6ad-497f-a2e0-bbcb8359cd8b	\N	t	2026-07-03 12:58:59.859	2026-07-03 12:58:59.859	12
026f4be5-4d9e-4804-a998-b0af02c116b2	michael.smith25	$2a$10$c5ahXDWZC/bd9.OVYvJgx.dkRwIRArBtTyr7y3wAVHlwJOaUecBgi	owner	b2949a33-e120-46d6-918b-5aec4a3abaad	\N	t	2026-07-03 12:58:59.927	2026-07-03 12:58:59.927	12
a28affb0-12c4-4190-9970-f8a2f226c0e9	david.doe26	$2a$10$Zx0rPNxVuphynRZEOKcKuucfHboX.FrwqRDbpltxnYhpE5zh3aY9O	owner	64511d6c-cecb-49f0-891d-9506b06b9142	\N	t	2026-07-03 12:58:59.993	2026-07-03 12:58:59.993	12
2abee96c-ab54-4629-b5ec-e0c5a15d12c3	james.williams27	$2a$10$v/YPtRC7tzprKlVrCLPLKuz4LBBsj8v3cqyTDeQVL6BIZs2cA7JOm	tenant	b2555119-62fe-437b-b776-d48d003c6f93	\N	t	2026-07-03 12:59:00.061	2026-07-03 12:59:00.061	12
d8e8994c-809d-4ea4-a084-319157dc60a8	patricia.jones28	$2a$10$OooCAO7MW05uSzQlYalxXu0aTUrBKH2W0Yh5qXKVnEa2W/jkYUNfW	owner	b6d40d59-bddb-4a2a-b446-d303dbcce4f1	\N	t	2026-07-03 12:59:00.126	2026-07-03 12:59:00.126	12
16091775-bb25-4584-bf21-4dfec69cf8b1	linda.rodriguez29	$2a$10$U8rd.VCsGs6mzp.NnfrGGefizyKMfoR2jVEbfBR4JjQ3RiROjIBw2	owner	d293dd0c-5f3d-41d7-9f62-db7799869374	\N	t	2026-07-03 12:59:00.193	2026-07-03 12:59:00.193	12
59d8b050-3c2b-49d6-b369-22b08551d16e	barbara.gonzalez30	$2a$10$iFwCYVNWt6wtIdh4YbrtEulc8QQXOMZ7X8ZFQWnQvsDzN7eIUitJS	tenant	e58e69b6-0780-417e-b55e-6f1a4c59cad9	\N	t	2026-07-03 12:59:00.262	2026-07-03 12:59:00.262	12
776985f5-506c-4188-948d-67f1706a32b1	william.moore31	$2a$10$nO6lzXcVQcWSPLvbn1F4IO1waXzNsiIhPnnu4Nwa0JG3/Bm/KX77a	owner	62aa0d0b-df0a-45e6-97f7-1fe04db631c0	\N	t	2026-07-03 12:59:00.328	2026-07-03 12:59:00.328	12
c27af145-ede7-4986-af47-0c48402ab75b	elizabeth.doe32	$2a$10$UachUygS3G6uASSS2eGNFOtp2yL1640HKHOMfbomy.Rs0CXtZAdOW	owner	6fd7f1e7-5165-4c40-b036-90565b16224c	\N	t	2026-07-03 12:59:00.39	2026-07-03 12:59:00.39	12
dbf48bfa-8478-4a67-8fdf-d542cfc06309	joseph.brown33	$2a$10$roOgK/0TLtMQMNCKBK8QguUvderbbr10EpjK0xftU6sdT9Whn/jnO	tenant	b5f2cdf7-cd0c-41c4-9e05-cbd444dc394c	\N	t	2026-07-03 12:59:00.456	2026-07-03 12:59:00.456	12
1f7c188b-59a3-42ba-b213-73da36ca01a6	susan.davis34	$2a$10$jVP8qt9gkLo5SwR2YkG6fuPDs1r4.5DoE.JDJW6zHRx.RXHCOLAi2	owner	97b63412-ce08-4806-9747-be5ae890a9f2	\N	t	2026-07-03 12:59:00.522	2026-07-03 12:59:00.522	12
7a9e235d-ced1-4c98-9328-72657266f559	thomas.martinez35	$2a$10$PtvEAcjDLJSmIbntTQGBUu9BUFAVf22Kla/VGzkFeTeQjrulz5RtC	owner	fb3fbb12-69c9-464a-b041-bd043879d519	\N	t	2026-07-03 12:59:00.594	2026-07-03 12:59:00.594	12
15bd99d7-232f-49aa-92ca-f8e6779f16cf	jessica.jackson36	$2a$10$jBVq60X7mH9dnECzFzflpON9atXWBq52GvPluk/3Qf.7kiNRdQqAe	tenant	60587923-6fb6-4603-92d8-50f82369f0b5	\N	t	2026-07-03 12:59:00.667	2026-07-03 12:59:00.667	12
e99c1e6d-a62e-42a6-8205-d04309793589	sarah.smith37	$2a$10$K3JjEFlLzTAVIwxWMXA3eejjSIhsASSTF/rR8sz3Iu3swKSmJbrBC	owner	f1382a62-37e8-459a-88c0-ce36829b6192	\N	t	2026-07-03 12:59:00.731	2026-07-03 12:59:00.731	12
36bb7aec-12e8-40a4-b58e-eb9090699095	karen.garcia38	$2a$10$ip17TOf8iiwSbQqOkI31DOzhT5BV0T7X4MwHXQV4yhxpj4ogtQrOe	owner	75bbb33d-cd10-4ecb-a640-45cbed19b760	\N	t	2026-07-03 12:59:00.797	2026-07-03 12:59:00.797	12
9bbe044a-da1d-4094-baf4-9488402c90f8	nancy.hernandez39	$2a$10$Mz4Lh..H0Rcq4CMzlSpN6.FM5XvLY9UjvA.mZudjO1ZDTjVppfYEm	tenant	5c3e798f-37ee-41ff-8229-0b5d0b7cbb3f	\N	t	2026-07-03 12:59:00.862	2026-07-03 12:59:00.862	12
697cf58f-ff07-4c93-b6f4-fcc90a9c70f4	lisa.thomas40	$2a$10$Ka95mD/rFZwYfFn8md4gEuPQ64Z.6ktpSzy0NmRMr076vVAeOGHD.	owner	42568d89-4db3-4e23-b0d3-86b73cadefc1	\N	t	2026-07-03 12:59:00.927	2026-07-03 12:59:00.927	12
8014dd54-45ca-4b60-a3ed-6512257ddcc8	john.jackson41	$2a$10$J3lrfY/WwRsthZ.t3j3PhuDf2282Om2BJ0wknBuZEJLqZexVvlaXi	owner	9a5e7dad-132b-4c6e-983c-582730a4f57b	\N	t	2026-07-03 12:59:00.994	2026-07-03 12:59:00.994	12
a466ada9-6522-4aa8-a3c9-092f69560f00	jane.johnson42	$2a$10$lACmQA1QjBj4TLN8rxgnjucBxa991CVlIWOw8t9ijvN9jHLilUhGu	tenant	af518e62-efab-460f-9078-19c462007ea4	\N	t	2026-07-03 12:59:01.06	2026-07-03 12:59:01.06	12
76375f27-e57a-467d-a126-b0cf10b54c1c	robert.jones43	$2a$10$r4jQPD9N43APK0nqAHe/0uWiG5dxZajdz9UDYO4avTKT5LxxIrzZm	owner	c066ca13-3d0b-4c63-8ff9-f5441eb2ea00	\N	t	2026-07-03 12:59:01.126	2026-07-03 12:59:01.126	12
d69b3e00-749f-4bc2-92ce-43a20b1f2f35	mary.davis44	$2a$10$4TU53.mng7Wwm5sblkIGu.op.BDRUiZun0C4I.6ODyp9iHyayQnp2	owner	b6a90391-3765-49a5-b278-a039c603117c	\N	t	2026-07-03 12:59:01.19	2026-07-03 12:59:01.19	12
f13d3ff2-d401-4f86-b97d-1d773f8eb728	michael.hernandez45	$2a$10$cAvs86NVdiQTRChTMrDkquc0sspkN1JT2VVj.IeLedHpAdzOzBNsm	tenant	2ca88459-564e-43af-bd68-a1da89a5fff9	\N	t	2026-07-03 12:59:01.256	2026-07-03 12:59:01.256	12
ac8c1ac6-4114-4f42-a5cf-24c83e4d1990	david.wilson46	$2a$10$/JBXwbFuzePanwyztf7o5ulqmX/aWoUMzyw0.wIYA9ThRVdM/o5/K	owner	bf12373e-16ad-4ff5-8a2d-dad9bd6b49d2	\N	t	2026-07-03 12:59:01.323	2026-07-03 12:59:01.323	12
55e645a8-bd0d-416f-a243-6feb4b58e1c9	james.taylor47	$2a$10$ohl6.i66KlsChP/3NcLzkeEBbr/pQp2fk.CMgnWzB.1YOgwuyls76	owner	a0777291-4ebb-44f4-838a-cc2f2325b003	\N	t	2026-07-03 12:59:01.388	2026-07-03 12:59:01.388	12
65c56b75-837f-4af0-848a-42b95e8f12eb	patricia.moore48	$2a$10$56yviItG1BrPWeqCU4xaUe6JKufBa4Mj9TPcPOdU7VNdVhIknG1A.	tenant	ddb61876-67c7-4395-a258-42f904992316	\N	t	2026-07-03 12:59:01.452	2026-07-03 12:59:01.452	12
4e7ba926-bce8-4922-932b-68f570c1298d	linda.smith49	$2a$10$de7Ltx6J/g9Uh7b5gkPrIOctOBtE0LTejbgteehiFO514Vrt5RtK2	owner	be4e293e-9e1c-4832-9eab-74c0dbaa4727	\N	t	2026-07-03 12:59:01.519	2026-07-03 12:59:01.519	12
38f1fd24-0f8b-4872-be76-4645beaabad2	barbara.doe50	$2a$10$m/1zCP1pgLHuF0PxV/r5gO6xNC9fI7E6r/VkukS2XDtiLPDvxtUh2	owner	9b8de1c2-606e-44d7-863a-38c1dadc2ac9	\N	t	2026-07-03 12:59:01.585	2026-07-03 12:59:01.585	12
97179953-b9a2-420b-8325-16a9566b2206	william.johnson51	$2a$10$g1rg0TdfzP052YSkTZ8LauIgVvkTSehfGluqVY5MRRVIOv9nFVaUC	tenant	b47a70bf-e782-432e-8781-be048c1dd86b	\N	t	2026-07-03 12:59:01.653	2026-07-03 12:59:01.653	12
5a276ca2-9d73-4e01-8e43-1e5aeea0c7be	elizabeth.brown52	$2a$10$4pCLyNlIpA/IUep.A5huseR/f94BxixH48ux0R3HBgekLf5gxmAjK	owner	a9b12763-d066-4707-a8e3-38793d9ce373	\N	t	2026-07-03 12:59:01.718	2026-07-03 12:59:01.718	12
4d50bfb0-cbde-4e8d-98b5-42bf6a7129f2	joseph.williams53	$2a$10$LuZ4dDHmL3Vi2UU5REu5UuDpTkwv97MOlw.xnPGEaFVtnGPr8v4fK	owner	ac6a65f5-d25d-4459-80cb-50daf37fc9a5	\N	t	2026-07-03 12:59:01.784	2026-07-03 12:59:01.784	12
3821030e-028c-46f0-9e5c-cc921a65c4ae	susan.jones54	$2a$10$otJga7SONdIdsJArFrQ3nOrHYCrPSX/sKSgPw2jMIWFxQjpkX46g6	tenant	e7db5988-550a-4116-b10e-b64aac2b6acc	\N	t	2026-07-03 12:59:01.848	2026-07-03 12:59:01.848	12
05823a99-9276-42d1-957f-63b43e31cd73	thomas.garcia55	$2a$10$q.6oWPuVb7fBBO6G5QJGQeB6pQyyP4PjEsNtq5vTo1UZ0vbhY4Jsi	owner	3db1d0ca-3a0f-4145-b49a-4712b19e47b5	\N	t	2026-07-03 12:59:01.914	2026-07-03 12:59:01.914	12
2cc207a8-c36c-44dd-abfb-67eaf7d69e5e	jessica.miller56	$2a$10$GuaeVVbFA4520/iU6owDzuxZG0vHPyGF5SUFoP8bwTtRmIVEjNJo6	owner	092efc66-aa05-4e32-b530-683db6214472	\N	t	2026-07-03 12:59:01.984	2026-07-03 12:59:01.984	12
3103864b-d619-4fac-9a7d-b34b2d7deaea	sarah.davis57	$2a$10$553kQUVGJc3/gPKYyB8NJ.MqbUoGa7EIdkgHsU.HbW8wyRerH6NzO	tenant	7052864c-085d-4373-abd0-d3e90a35aed1	\N	t	2026-07-03 12:59:02.05	2026-07-03 12:59:02.05	12
b27c96b5-93f3-43c3-80db-debfffdca4f6	karen.rodriguez58	$2a$10$AOvGdpejVSAQyP2j//MuQOl/Y8lt8kY6csgLuuJnjYiTKPe/kN9Li	owner	2b3ac0b4-79c4-43b9-b038-dcc94f6128cf	\N	t	2026-07-03 12:59:02.121	2026-07-03 12:59:02.121	12
00b47a35-8e76-45d0-996c-d0dac6522045	nancy.martinez59	$2a$10$2YimoKzQj2yMO1y1nhf1ruiechJWRdccdTowMVb7tZ4TepRRqvtnO	owner	3060a46c-6829-41c5-93df-78c667e1fc1e	\N	t	2026-07-03 12:59:02.186	2026-07-03 12:59:02.186	12
3bf89b14-1db6-4e1b-bb83-c10bf8a07793	lisa.hernandez60	$2a$10$RN5FyETFHfb6LRL9DX05JO/pZ33SWGK1Js9E1lFFLaxJskV2mq8bS	tenant	d4f98c73-3ad7-4266-8c66-ed9ba2c887fd	\N	t	2026-07-03 12:59:02.253	2026-07-03 12:59:02.253	12
2790ffcb-5715-4ddc-b445-3365777e02fe	john.lopez61	$2a$10$YgIV/578ZJBFusJrycTgu.gouXbDHS79pR95XB82N90POfg0aEUla	owner	9aa8ee85-3a65-48b2-b02f-8e0b74f0c9da	\N	t	2026-07-03 12:59:02.321	2026-07-03 12:59:02.321	12
a88f538e-36c7-4da5-9ed1-9fae48f97907	jane.gonzalez62	$2a$10$JZFIv1ovtbMdRkhm9/.buuCEGyg0MKtH5VXEx9fd2lU7TdIkuKLb2	owner	c3048ed9-35e0-4d52-9e12-5b3f5b13dc57	\N	t	2026-07-03 12:59:02.389	2026-07-03 12:59:02.389	12
f3ace69a-4869-4f28-83f0-57223a1aba0a	robert.wilson63	$2a$10$FA1OhCQjd.GQE64xSYrFWuPXS7jF1a3Q/TxK4miYtwZoNd/GVrluS	tenant	a7f86a28-da2c-47f4-b80f-c0ec1aacc145	\N	t	2026-07-03 12:59:02.455	2026-07-03 12:59:02.455	12
641d0a2a-cff9-4e9b-ad15-64a5304d1d42	mary.anderson64	$2a$10$WfetVEnC5CNjxtFbnSegCOUjBEwl7rReW86CRolrfkrYsGPVCBdam	owner	66001d25-3a5d-4c86-bae4-e827e46f51e4	\N	t	2026-07-03 12:59:02.52	2026-07-03 12:59:02.52	12
a8032803-d218-4de6-9b19-49f585edfa65	michael.thomas65	$2a$10$IIIvFldBjmk52ZplFItrMuGm1AWxnkju8Griy57BgymVXyItQSW5.	owner	0309a72b-34e1-4e5f-82a1-3aa11505ed0b	\N	t	2026-07-03 12:59:02.586	2026-07-03 12:59:02.586	12
c598f2a0-2adb-482e-ab9d-00b4320ca733	david.taylor66	$2a$10$mTOgoptRl7zJa3/WEnA7U.uUrI3nfI2kIYGSiBwComatcIYowkZLK	tenant	d7a8346e-f13c-4103-9f6e-be5f5d9f2145	\N	t	2026-07-03 12:59:02.662	2026-07-03 12:59:02.662	12
fd3aa62a-2a60-4939-95dd-501ffbc40694	james.moore67	$2a$10$NClaeFoCQR0HtgyUKo4nKuasntmmhI9TVNmRQcYdKGU5LEXaf9uJe	owner	b7ff20ab-377d-45f7-8ef0-9359af3a7562	\N	t	2026-07-03 12:59:02.732	2026-07-03 12:59:02.732	12
1f238e88-2003-49f2-a705-da9935980bf7	patricia.jackson68	$2a$10$43Tf7LYj.S.Y0PaVaThxi.Kn/2o9IxZbh5e95AA9N21wkyChPzIVi	owner	73cd3276-28d8-4d66-99e5-7c9e2779290b	\N	t	2026-07-03 12:59:02.804	2026-07-03 12:59:02.804	12
0a446607-506b-44c5-80cf-cfff9109ed9b	linda.smith69	$2a$10$1XYte5VvXs92YalhPJ0uxekVcXmKTZ8NmVVaOsFvSIDWfZOu/giiW	tenant	2053b3fc-82f6-45b6-bbd8-843329aeedbd	\N	t	2026-07-03 12:59:02.874	2026-07-03 12:59:02.874	12
50c0da1e-0db9-4fc9-9f28-d63f2813dca4	barbara.doe70	$2a$10$xvp.QzfLGi1X1CbDJva7cOJXNB3pADKe4eWGgu5kGLMEOCEQ.3NbK	owner	5b0c2ed8-6f2a-4dbf-86a4-50a81896f744	\N	t	2026-07-03 12:59:02.941	2026-07-03 12:59:02.941	12
75ee0f1f-77f9-4581-8917-05c53349e8e9	william.johnson71	$2a$10$JCPFgzxvSk7jOHtmNw5JXuk88Z0hsYvJlkvngfgkH5z13AquF2tQW	owner	b6421aa4-c611-46c2-ab5a-daad41b83931	\N	t	2026-07-03 12:59:03.012	2026-07-03 12:59:03.012	12
96d2f461-2036-4f88-9fad-02ef47f4bc76	elizabeth.brown72	$2a$10$Eu3KFSa.qbz80N1dCwVfQu.7GQZJe126ZAyXYXnCg6t6MzIv8TIjq	tenant	9e5e4aaf-31c1-4202-8861-f4ea8cf6bd3b	\N	t	2026-07-03 12:59:03.079	2026-07-03 12:59:03.079	12
dc61613f-78d8-41bf-b193-cc2af6bace67	joseph.williams73	$2a$10$nTOnYQ9QCen1iwDOA9tiw.oBh0ztw7TmXv2jqdyIBVXo5196x/DVq	owner	8184d556-0612-4944-8f24-fcb179ea9c0c	\N	t	2026-07-03 12:59:03.145	2026-07-03 12:59:03.145	12
b8f9cb39-b40a-47c5-90f3-b39ab9fa8d85	susan.jones74	$2a$10$pl6ofo9p3.l.tm1.InCOwOp/7v0L8GOD25tOP.MEyj9myeHwXV22i	owner	193ed9bd-fe08-437c-bbe6-64b94729b37c	\N	t	2026-07-03 12:59:03.209	2026-07-03 12:59:03.209	12
61296f11-6b5f-40bd-ad51-cd8d97dbe8f4	thomas.garcia75	$2a$10$gYMIxzkR.mHIO5ia/L1bkexp/2rsZOY7po9HZEjQVk./whBVc2DwG	tenant	15ead7cc-c6cc-4818-bf73-44dc025ae48a	\N	t	2026-07-03 12:59:03.278	2026-07-03 12:59:03.278	12
b8ef411b-129b-4784-959f-b83f48235201	jessica.miller76	$2a$10$DbHBnjiTwNsYhoB3X8/ZW.UClEn0DhcEhl8mgcyAdGr/Y5IDMqomW	owner	aaa89483-d4fd-485a-8e18-32c3155e1aa2	\N	t	2026-07-03 12:59:03.341	2026-07-03 12:59:03.341	12
ab55d03d-e084-479c-9513-4cb81b970eb8	sarah.davis77	$2a$10$6y3n0BsT9XKtJFArCPQ/auytkrko7clnlFJIrjHfoasCx66F7cvly	owner	41e9960b-e7d2-461a-b65d-77b409a17dff	\N	t	2026-07-03 12:59:03.406	2026-07-03 12:59:03.406	12
212c4ecd-def7-49c2-acaf-6a71d3b3b9c1	karen.rodriguez78	$2a$10$bAgSVQ9ClbVWhayPuYNITu4YoCP7y4iGPmO.E3TBy/wzNPoM3Z99W	tenant	617f48db-a5ea-4b2b-9595-390e3943610a	\N	t	2026-07-03 12:59:03.474	2026-07-03 12:59:03.474	12
d909a994-d709-4659-b5f2-0d4a0177d57d	nancy.martinez79	$2a$10$AorTYATWn/.Wy1ElMJXaL.lg9dlXxTSdmTlOoqxftxt5bnEaVsKOe	owner	c2d093d1-02c9-4f24-a2e7-0956693c82ce	\N	t	2026-07-03 12:59:03.546	2026-07-03 12:59:03.546	12
c66b96ff-b273-4e30-a79c-963c3bbe3893	lisa.hernandez80	$2a$10$vrCywlZp9nZLYqsra5FH/.DM16O2TyUxFyB7EvKNoEFiqt670P9C.	owner	e8d73934-f296-4e0d-82c8-5eaf3806deed	\N	t	2026-07-03 12:59:03.631	2026-07-03 12:59:03.631	12
b1a887a8-0b70-422a-ba64-8112efb5f6bd	john.lopez81	$2a$10$9hcD2HDEaXftFnnt32ZptOHHAx7adVKVpRucKnWreRfggSZqXdiUS	tenant	6687b35b-fecd-4bac-8a11-68f229e126e6	\N	t	2026-07-03 12:59:03.711	2026-07-03 12:59:03.711	12
1afe4826-b016-4f11-85d3-896013cf8c1c	jane.gonzalez82	$2a$10$jvevGukvvpr1DLHD6gEwaOCzJor0Iu/8/kgyDNyhVMVbsCS6Ygw5.	owner	bd667102-ffed-40fd-a29e-841e0b1a2483	\N	t	2026-07-03 12:59:03.792	2026-07-03 12:59:03.792	12
39bf0970-57da-46d9-b94e-1c4d01ceef7a	robert.wilson83	$2a$10$/8HwUME8fqtCRvnUwcfgce8sUq1CZg77wR.SLu6lGJhsGtWxn/b5q	owner	a10ecfb2-e5ed-4283-8ece-3a063095bea3	\N	t	2026-07-03 12:59:03.861	2026-07-03 12:59:03.861	12
1a137e51-36e6-401f-b6eb-5b61fdff9602	mary.anderson84	$2a$10$STbzAIJ9V6HLbpTzty4JP.sn9LnO05snSs4XVZYx.r08494YhDJzC	tenant	0f56fb51-076f-4408-b7cc-f437da102310	\N	t	2026-07-03 12:59:03.923	2026-07-03 12:59:03.923	12
cc874b11-2925-48fc-b125-50d3a1d15eb4	michael.thomas85	$2a$10$BCos8NcxxU/0VT.jv9W3w.Yrvs2sS.RnMO0FfaInCXnDNu7Cx6FbK	owner	687135f6-8316-443c-94a0-281051cce6a5	\N	t	2026-07-03 12:59:03.989	2026-07-03 12:59:03.989	12
f6c76e9a-357d-4c4a-97cc-15c8550fc8c0	david.taylor86	$2a$10$AO/q6DO5UTiLni40w1US6.XU/RmjzVZH2XmBvQRvSQMDURJth.Ere	owner	d3a6fd9d-a0b0-4b4e-a3de-4b3aaef6fdf0	\N	t	2026-07-03 12:59:04.056	2026-07-03 12:59:04.056	12
fad5480f-edb4-485b-b856-970ae5f0156c	james.moore87	$2a$10$S/ZH9oqsCFS4gaOU.D205Op2RM.oDiw8p3Md.a8iSnaUXdyVAtoZa	tenant	75f0f97d-8676-4045-9e26-f0c1653339bf	\N	t	2026-07-03 12:59:04.12	2026-07-03 12:59:04.12	12
074c58df-6d88-41c0-a338-bd9e8808388b	patricia.jackson88	$2a$10$RlsZw5aFb2vRdCCFt.zzaOJh47qcBn77wxThLqqGGVJaWrOsU6atO	owner	e87dacda-b334-475e-8ad1-9c61e9adfffc	\N	t	2026-07-03 12:59:04.185	2026-07-03 12:59:04.185	12
d77a4507-e981-4838-a755-2754778623f2	linda.smith89	$2a$10$ZDqPUoc23Nl0heJ9Xeo5fO1qz.7q/xEl2I4L2f3nBD/CyYo0TRROS	owner	97d7fe2d-24ef-40c1-9bb3-33d5fb3b7ed0	\N	t	2026-07-03 12:59:04.249	2026-07-03 12:59:04.249	12
777d58b4-8c14-41fc-8f37-ff23611329f5	barbara.doe90	$2a$10$q1TPSkuI4krTjq5qohn51ODGSy6t5Lzm9lTNCQu0gFXAVfjB4N4b6	tenant	e7ecad30-0be5-4e7b-9427-774847901d70	\N	t	2026-07-03 12:59:04.312	2026-07-03 12:59:04.312	12
03487c6c-44e5-4d31-89d2-b51e3a408147	william.johnson91	$2a$10$w1CjJVOLzlotVSxfmUd5juFqnLU4ALn5ZzmsXe5endDyi.mySQkVy	owner	8486c53d-13c7-4e68-bae8-76f60d2bc4bd	\N	t	2026-07-03 12:59:04.373	2026-07-03 12:59:04.373	12
e9c8ff30-c40b-4543-b485-e691beb09d84	elizabeth.brown92	$2a$10$1u4tOJZsJQU9ePeqjycZNuD5ZkX96BT3VDsv0FRiwBY.HsND.VWGO	owner	2b561152-ee10-4d51-bd75-855740d4a309	\N	t	2026-07-03 12:59:04.438	2026-07-03 12:59:04.438	12
1c28670c-a589-4760-9042-a613552058aa	joseph.williams93	$2a$10$OWB2bMaLDvy8jzh6cPMS2uJacs6VPDY60UD5kLL/nw3thUpTfM2uq	tenant	b69bf868-8953-48a1-a66c-7a936c89e292	\N	t	2026-07-03 12:59:04.502	2026-07-03 12:59:04.502	12
a9f6fb0d-fc6b-41ee-bcec-d1c3b1798037	susan.jones94	$2a$10$NApJaEEH9.Uzz7JgOnAY5eg7WkRJ3p9GuuQ.jvWNlk7tYg3LoW9VW	owner	ae539f9c-b53c-4c50-b243-a2c3ead279e0	\N	t	2026-07-03 12:59:04.566	2026-07-03 12:59:04.566	12
72c44b22-f4ce-4686-9cc5-07dbd465c60a	thomas.garcia95	$2a$10$zhD.x9HvXg0ugdf45Bsq7e.iTDoDUyU/2Zmr5ViB.8gpkKIiVbzT.	owner	5b64b033-e513-478d-af74-efef74a66373	\N	t	2026-07-03 12:59:04.629	2026-07-03 12:59:04.629	12
9b8ef93a-74e6-4465-a923-1f65948cdb69	jessica.miller96	$2a$10$YVTQmaI6lmMnUtybdTRTn.rZupd7k43/p50e.dZ6LU7oIxcMR8DVu	tenant	19fbb597-a8bf-4e52-892d-708cdea8db61	\N	t	2026-07-03 12:59:04.696	2026-07-03 12:59:04.696	12
15acbf65-60d9-4fcc-a01c-2151edba2156	sarah.davis97	$2a$10$c2/2sAsyWxXC5rnmf3WIueAFJ3Ql5IDxY3KhQ.HdlfKH8z763bmgC	owner	947a2547-7d9e-41a9-a971-302770749fa6	\N	t	2026-07-03 12:59:04.761	2026-07-03 12:59:04.761	12
55ab9a48-f137-4d94-b636-04ab4355634c	karen.rodriguez98	$2a$10$ezBQMOG3fcXlEQjVO1tF2eK26RBi0PweXqAJOd5Ory4FJ85N70aiK	owner	dfbef3dc-39bd-4295-86c1-f2997963f6f9	\N	t	2026-07-03 12:59:04.826	2026-07-03 12:59:04.826	12
be0ba415-e053-470b-8dd3-462d3fe6ab45	nancy.martinez99	$2a$10$anin4AUD4C0hYvNNYs/k1up8W5MIurGk.66lj6mt2VpQ4rZck51Uu	tenant	9248b051-e9de-4c78-8862-b6a03e59cde2	\N	t	2026-07-03 12:59:04.89	2026-07-03 12:59:04.89	12
33a4d911-4a47-4503-8840-eb621776adad	lisa.hernandez100	$2a$10$Avr8Rx3lkAzNkZqL5fOpW.Z55J2YEeeJ.LDhHbEfDr1JUEHRRdnHa	owner	c91d7e65-2178-4d8e-8847-68a619c00b84	\N	t	2026-07-03 12:59:04.955	2026-07-03 12:59:04.955	12
f4423bf8-f4a9-4016-95ca-6ebf8f3dfc92	gr_admin	$2a$10$O5ToLcJ3U0/z9o5BtHXZ7.34.8uxgHWAYVG0FBhnm3zeCDyLQutlm	admin	\N	\N	t	2026-07-10 12:22:04.163	2026-07-10 12:22:04.163	14
eadc2397-6bc4-45e3-bff7-141266f25100	adams_admin	$2a$10$hZgClku4vt2N6ZVs6fDCteNk0LeyUr7CxnBVTx4hXiHueUMpMYQ/i	admin	\N	\N	t	2026-07-11 09:17:17.156	2026-07-11 09:17:17.156	15
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, "residentId", "flatId", "vehicleType", "vehicleNumber", make, model, color, "isActive", "createdAt", "updatedAt") FROM stdin;
28fc8306-f3f0-423f-ade8-eee17c13b380	244152f9-4cad-4ffe-bb78-7034547a12f5	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	car	MH12AB5678				t	2026-06-05 10:43:04.065	2026-06-05 10:43:04.065
391f460a-02c8-46d1-b697-ff8d7597a9c4	3cdfdb5b-d836-442e-8617-bffcb46bc000	031546ee-e650-4153-8f4c-1fc7f14d9e6c	car	MP09ZJ2004				t	2026-06-27 08:53:43.538	2026-06-27 08:53:43.538
678f990c-0d75-4ee2-821d-7f60164e19bb	3cdfdb5b-d836-442e-8617-bffcb46bc000	031546ee-e650-4153-8f4c-1fc7f14d9e6c	scooter	MP09UR2004				t	2026-06-27 08:53:57.354	2026-06-27 08:53:57.354
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendors (id, "societyId", name, "contactPerson", phone, email, "serviceType", notes, "isActive", "createdAt", "updatedAt") FROM stdin;
d4d19a77-2890-452c-a550-030073771f8f	1	Otis Elevators	Alpha	99988584642	asd@m.com	Lift Maintenance		t	2026-06-10 06:13:49.799	2026-06-10 06:13:49.799
\.


--
-- Data for Name: visitors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.visitors (id, "flatId", "visitorName", phone, "vehicleNumber", purpose, "entryTime", "exitTime", "loggedBy", "createdAt", "updatedAt", "visitorType") FROM stdin;
3f46a00e-754a-4e65-9201-1b0cf28165ab	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Amit Sharma	9000000001	\N	Delivery	2026-06-05 08:19:55.73	2026-06-05 08:19:55.754	4d3a63ed-802e-4018-bc31-ba2b1ca300f2	2026-06-05 08:19:55.73	2026-06-05 08:19:55.755	other
136c0799-88c3-41d2-91ae-937660704138	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Amit Sharma	9000000001	\N	Delivery	2026-06-05 08:27:42.984	2026-06-05 08:27:43.006	4d3a63ed-802e-4018-bc31-ba2b1ca300f2	2026-06-05 08:27:42.984	2026-06-05 08:27:43.007	other
d5eac1a3-0935-468b-8860-be6a2d771d8b	95a93cab-c4a0-4a5e-898e-1e9d442a3e85	Amit Sharma	9000000001	\N	Delivery	2026-06-05 08:28:34.628	2026-06-05 08:28:34.66	4d3a63ed-802e-4018-bc31-ba2b1ca300f2	2026-06-05 08:28:34.628	2026-06-05 08:28:34.66	other
\.


--
-- Name: expense_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.expense_categories_id_seq', 90, true);


--
-- Name: societies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.societies_id_seq', 15, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: amc_contracts amc_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_contracts
    ADD CONSTRAINT amc_contracts_pkey PRIMARY KEY (id);


--
-- Name: amc_service_logs amc_service_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_service_logs
    ADD CONSTRAINT amc_service_logs_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: blacklisted_tokens blacklisted_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blacklisted_tokens
    ADD CONSTRAINT blacklisted_tokens_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- Name: blocks blocks_societyId_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT "blocks_societyId_name_key" UNIQUE ("societyId", name);


--
-- Name: committee_achievements committee_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_achievements
    ADD CONSTRAINT committee_achievements_pkey PRIMARY KEY (id);


--
-- Name: committee_members committee_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT committee_members_pkey PRIMARY KEY (id);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: event_contributions event_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_contributions
    ADD CONSTRAINT event_contributions_pkey PRIMARY KEY (id);


--
-- Name: event_expenses event_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_expenses
    ADD CONSTRAINT event_expenses_pkey PRIMARY KEY (id);


--
-- Name: event_team_members event_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_team_members
    ADD CONSTRAINT event_team_members_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: expense_categories expense_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (id);


--
-- Name: flats flats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT flats_pkey PRIMARY KEY (id);


--
-- Name: helpers helpers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.helpers
    ADD CONSTRAINT helpers_pkey PRIMARY KEY (id);


--
-- Name: income_records income_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.income_records
    ADD CONSTRAINT income_records_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: login_sessions login_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT login_sessions_pkey PRIMARY KEY (id);


--
-- Name: maintenance_bills maintenance_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_bills
    ADD CONSTRAINT maintenance_bills_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_sessions onboarding_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT onboarding_sessions_pkey PRIMARY KEY (id);


--
-- Name: parking_slots parking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT parking_slots_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: residents residents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT residents_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: societies societies_account_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_account_number_key UNIQUE ("accountNumber");


--
-- Name: societies societies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_pkey PRIMARY KEY (id);


--
-- Name: societies societies_society_url_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.societies
    ADD CONSTRAINT societies_society_url_key UNIQUE ("societyUrl");


--
-- Name: society_settings society_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.society_settings
    ADD CONSTRAINT society_settings_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: totp_secrets totp_secrets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.totp_secrets
    ADD CONSTRAINT totp_secrets_pkey PRIMARY KEY ("userId");


--
-- Name: user_notes user_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT user_notes_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_societyId_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_societyId_username_key" UNIQUE ("societyId", username);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: visitors visitors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT visitors_pkey PRIMARY KEY (id);


--
-- Name: blacklisted_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blacklisted_tokens_token_key ON public.blacklisted_tokens USING btree (token);


--
-- Name: committee_members_committeeId_residentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "committee_members_committeeId_residentId_key" ON public.committee_members USING btree ("committeeId", "residentId");


--
-- Name: committees_societyId_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "committees_societyId_name_key" ON public.committees USING btree ("societyId", name);


--
-- Name: event_team_members_eventId_residentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "event_team_members_eventId_residentId_key" ON public.event_team_members USING btree ("eventId", "residentId");


--
-- Name: expense_categories_societyId_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "expense_categories_societyId_slug_key" ON public.expense_categories USING btree ("societyId", slug);


--
-- Name: flats_societyId_flatNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "flats_societyId_flatNumber_key" ON public.flats USING btree ("societyId", "flatNumber");


--
-- Name: invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON public.invoices USING btree ("invoiceNumber");


--
-- Name: maintenance_bills_flatId_month_year_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "maintenance_bills_flatId_month_year_key" ON public.maintenance_bills USING btree ("flatId", month, year);


--
-- Name: onboarding_sessions_societyId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "onboarding_sessions_societyId_key" ON public.onboarding_sessions USING btree ("societyId");


--
-- Name: parking_slots_societyId_slotNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "parking_slots_societyId_slotNumber_key" ON public.parking_slots USING btree ("societyId", "slotNumber");


--
-- Name: password_reset_tokens_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX password_reset_tokens_token_key ON public.password_reset_tokens USING btree (token);


--
-- Name: payments_billId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "payments_billId_key" ON public.payments USING btree ("billId");


--
-- Name: residents_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX residents_email_key ON public.residents USING btree (email);


--
-- Name: role_permissions_societyId_role_module_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_permissions_societyId_role_module_key" ON public.role_permissions USING btree ("societyId", role, module);


--
-- Name: societies_contactEmail_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "societies_contactEmail_key" ON public.societies USING btree ("contactEmail") WHERE ("contactEmail" IS NOT NULL);


--
-- Name: societies_registrationNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "societies_registrationNumber_key" ON public.societies USING btree ("registrationNumber");


--
-- Name: societies_setupToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "societies_setupToken_key" ON public.societies USING btree ("setupToken");


--
-- Name: society_settings_societyId_varName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "society_settings_societyId_varName_key" ON public.society_settings USING btree ("societyId", "varName");


--
-- Name: users_residentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_residentId_key" ON public.users USING btree ("residentId");


--
-- Name: users_staffId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "users_staffId_key" ON public.users USING btree ("staffId");


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: vehicles_vehicleNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON public.vehicles USING btree ("vehicleNumber");


--
-- Name: amc_contracts amc_contracts_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_contracts
    ADD CONSTRAINT "amc_contracts_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: amc_contracts amc_contracts_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_contracts
    ADD CONSTRAINT "amc_contracts_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: amc_contracts amc_contracts_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_contracts
    ADD CONSTRAINT "amc_contracts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: amc_service_logs amc_service_logs_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.amc_service_logs
    ADD CONSTRAINT "amc_service_logs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.amc_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: assets assets_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "assets_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blocks blocks_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT "blocks_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: committee_achievements committee_achievements_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_achievements
    ADD CONSTRAINT "committee_achievements_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public.committees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_members committee_members_committeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT "committee_members_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES public.committees(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: committee_members committee_members_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_members
    ADD CONSTRAINT "committee_members_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public.residents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: committees committees_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT "committees_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: complaints complaints_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT "complaints_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: event_contributions event_contributions_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_contributions
    ADD CONSTRAINT "event_contributions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_contributions event_contributions_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_contributions
    ADD CONSTRAINT "event_contributions_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: event_expenses event_expenses_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_expenses
    ADD CONSTRAINT "event_expenses_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_team_members event_team_members_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_team_members
    ADD CONSTRAINT "event_team_members_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public.events(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: event_team_members event_team_members_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_team_members
    ADD CONSTRAINT "event_team_members_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public.residents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: events events_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "events_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expense_categories expense_categories_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_categories
    ADD CONSTRAINT "expense_categories_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "expenses_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: family_members family_members_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT "family_members_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public.residents(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: flats flats_blockId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT "flats_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES public.blocks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: flats flats_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flats
    ADD CONSTRAINT "flats_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: helpers helpers_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.helpers
    ADD CONSTRAINT "helpers_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: income_records income_records_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.income_records
    ADD CONSTRAINT "income_records_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: invoices invoices_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: login_sessions login_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_sessions
    ADD CONSTRAINT "login_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: maintenance_bills maintenance_bills_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenance_bills
    ADD CONSTRAINT "maintenance_bills_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notices notices_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT "notices_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: onboarding_sessions onboarding_sessions_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT "onboarding_sessions_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: parking_slots parking_slots_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT "parking_slots_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: parking_slots parking_slots_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parking_slots
    ADD CONSTRAINT "parking_slots_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_billId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES public.maintenance_bills(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: residents residents_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.residents
    ADD CONSTRAINT "residents_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: society_settings society_settings_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.society_settings
    ADD CONSTRAINT "society_settings_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: staff staff_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT "staff_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: totp_secrets totp_secrets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.totp_secrets
    ADD CONSTRAINT "totp_secrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_notes user_notes_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT "user_notes_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_notes user_notes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notes
    ADD CONSTRAINT "user_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public.residents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_staffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: vehicles vehicles_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "vehicles_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vehicles vehicles_residentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "vehicles_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES public.residents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vendors vendors_societyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES public.societies(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: visitors visitors_flatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.visitors
    ADD CONSTRAINT "visitors_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES public.flats(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict ZSSOBkStG7yN4i9rz5W5k0EEqKGO7kqPXeYg6dEUDxo56q8tx7LuaAIrYDvpnsa

