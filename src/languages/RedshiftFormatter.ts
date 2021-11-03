import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';

const reservedFunctions = {
	// https://docs.aws.amazon.com/redshift/latest/dg/c_Aggregate_Functions.html
	aggregate: [
		'ANY_VALUE',
		'APPROXIMATE PERCENTILE_DISC',
		'AVG',
		'COUNT',
		'LISTAGG',
		'MAX',
		'MEDIAN',
		'MIN',
		'PERCENTILE_CONT',
		'STDDEV_SAMP',
		'STDDEV_POP',
		'SUM',
		'VAR_SAMP',
		'VAR_POP',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_Array_Functions.html
	array: [
		'array',
		'array_concat',
		'array_flatten',
		'get_array_length',
		'split_to_array',
		'subarray',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_bitwise_aggregate_functions.html
	bitwise: ['BIT_AND', 'BIT_OR', 'BOOL_AND', 'BOOL_OR'],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_conditional_expressions.html
	conditional: ['CASE', 'COALESCE', 'DECODE', 'GREATEST', 'LEAST', 'NVL', 'NVL2', 'NULLIF'],
	// https://docs.aws.amazon.com/redshift/latest/dg/Date_functions_header.html
	dateTime: [
		'ADD_MONTHS',
		'AT TIME ZONE',
		'CONVERT_TIMEZONE',
		'CURRENT_DATE',
		'CURRENT_TIME',
		'CURRENT_TIMESTAMP',
		'DATE_CMP',
		'DATE_CMP_TIMESTAMP',
		'DATE_CMP_TIMESTAMPTZ',
		'DATE_PART_YEAR',
		'DATEADD',
		'DATEDIFF',
		'DATE_PART',
		'DATE_TRUNC',
		'EXTRACT',
		'GETDATE',
		'INTERVAL_CMP',
		'LAST_DAY',
		'MONTHS_BETWEEN',
		'NEXT_DAY',
		'SYSDATE',
		'TIMEOFDAY',
		'TIMESTAMP_CMP',
		'TIMESTAMP_CMP_DATE',
		'TIMESTAMP_CMP_TIMESTAMPTZ',
		'TIMESTAMPTZ_CMP',
		'TIMESTAMPTZ_CMP_DATE',
		'TIMESTAMPTZ_CMP_TIMESTAMP',
		'TIMEZONE',
		'TO_TIMESTAMP',
		'TRUNC',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/geospatial-functions.html
	spatial: [
		'AddBBox',
		'DropBBox',
		'GeometryType',
		'ST_AddPoint',
		'ST_Angle',
		'ST_Area',
		'ST_AsBinary',
		'ST_AsEWKB',
		'ST_AsEWKT',
		'ST_AsGeoJSON',
		'ST_AsText',
		'ST_Azimuth',
		'ST_Boundary',
		'ST_Collect',
		'ST_Contains',
		'ST_ContainsProperly',
		'ST_ConvexHull',
		'ST_CoveredBy',
		'ST_Covers',
		'ST_Crosses',
		'ST_Dimension',
		'ST_Disjoint',
		'ST_Distance',
		'ST_DistanceSphere',
		'ST_DWithin',
		'ST_EndPoint',
		'ST_Envelope',
		'ST_Equals',
		'ST_ExteriorRing',
		'ST_Force2D',
		'ST_Force3D',
		'ST_Force3DM',
		'ST_Force3DZ',
		'ST_Force4D',
		'ST_GeometryN',
		'ST_GeometryType',
		'ST_GeomFromEWKB',
		'ST_GeomFromEWKT',
		'ST_GeomFromText',
		'ST_GeomFromWKB',
		'ST_InteriorRingN',
		'ST_Intersects',
		'ST_IsPolygonCCW',
		'ST_IsPolygonCW',
		'ST_IsClosed',
		'ST_IsCollection',
		'ST_IsEmpty',
		'ST_IsSimple',
		'ST_IsValid',
		'ST_Length',
		'ST_LengthSphere',
		'ST_Length2D',
		'ST_LineFromMultiPoint',
		'ST_LineInterpolatePoint',
		'ST_M',
		'ST_MakeEnvelope',
		'ST_MakeLine',
		'ST_MakePoint',
		'ST_MakePolygon',
		'ST_MemSize',
		'ST_MMax',
		'ST_MMin',
		'ST_Multi',
		'ST_NDims',
		'ST_NPoints',
		'ST_NRings',
		'ST_NumGeometries',
		'ST_NumInteriorRings',
		'ST_NumPoints',
		'ST_Perimeter',
		'ST_Perimeter2D',
		'ST_Point',
		'ST_PointN',
		'ST_Points',
		'ST_Polygon',
		'ST_RemovePoint',
		'ST_Reverse',
		'ST_SetPoint',
		'ST_SetSRID',
		'ST_Simplify',
		'ST_SRID',
		'ST_StartPoint',
		'ST_Touches',
		'ST_Within',
		'ST_X',
		'ST_XMax',
		'ST_XMin',
		'ST_Y',
		'ST_YMax',
		'ST_YMin',
		'ST_Z',
		'ST_ZMax',
		'ST_ZMin',
		'SupportsBBox',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/hash-functions.html
	hash: ['CHECKSUM', 'FUNC_SHA1', 'FNV_HASH', 'MD5', 'SHA', 'SHA1', 'SHA2'],
	// https://docs.aws.amazon.com/redshift/latest/dg/hyperloglog-functions.html
	hyperLogLog: ['HLL', 'HLL_CREATE_SKETCH', 'HLL_CARDINALITY', 'HLL_COMBINE'],
	// https://docs.aws.amazon.com/redshift/latest/dg/json-functions.html
	json: [
		'IS_VALID_JSON',
		'IS_VALID_JSON_ARRAY',
		'JSON_ARRAY_LENGTH',
		'JSON_EXTRACT_ARRAY_ELEMENT_TEXT',
		'JSON_EXTRACT_PATH_TEXT',
		'JSON_PARSE',
		'JSON_SERIALIZE',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/Math_functions.html
	math: [
		'ABS',
		'ACOS',
		'ASIN',
		'ATAN',
		'ATAN2',
		'CBRT',
		'CEILING',
		'CEIL',
		'COS',
		'COT',
		'DEGREES',
		'DEXP',
		'DLOG1',
		'DLOG10',
		'EXP',
		'FLOOR',
		'LN',
		'LOG',
		'MOD',
		'PI',
		'POWER',
		'RADIANS',
		'RANDOM',
		'ROUND',
		'SIN',
		'SIGN',
		'SQRT',
		'TAN',
		'TO_HEX',
		'TRUNC',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/ml-function.html
	machineLearning: ['EXPLAIN_MODEL'],
	// https://docs.aws.amazon.com/redshift/latest/dg/String_functions_header.html
	string: [
		'ASCII',
		'BPCHARCMP',
		'BTRIM',
		'BTTEXT_PATTERN_CMP',
		'CHAR_LENGTH',
		'CHARACTER_LENGTH',
		'CHARINDEX',
		'CHR',
		'COLLATE',
		'CONCAT',
		'CRC32',
		'DIFFERENCE',
		'INITCAP',
		'LEFT',
		'RIGHT',
		'LEN',
		'LENGTH',
		'LOWER',
		'LPAD',
		'RPAD',
		'LTRIM',
		'OCTETINDEX',
		'OCTET_LENGTH',
		'POSITION',
		'QUOTE_IDENT',
		'QUOTE_LITERAL',
		'REGEXP_COUNT',
		'REGEXP_INSTR',
		'REGEXP_REPLACE',
		'REGEXP_SUBSTR',
		'REPEAT',
		'REPLACE',
		'REPLICATE',
		'REVERSE',
		'RTRIM',
		'SOUNDEX',
		'SPLIT_PART',
		'STRPOS',
		'STRTOL',
		'SUBSTRING',
		'TEXTLEN',
		'TRANSLATE',
		'TRIM',
		'UPPER',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_Type_Info_Functions.html
	superType: [
		'decimal_precision',
		'decimal_scale',
		'is_array',
		'is_bigint',
		'is_boolean',
		'is_char',
		'is_decimal',
		'is_float',
		'is_integer',
		'is_object',
		'is_scalar',
		'is_smallint',
		'is_varchar',
		'json_typeof',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_Window_functions.html
	window: [
		'AVG',
		'COUNT',
		'CUME_DIST',
		'DENSE_RANK',
		'FIRST_VALUE',
		'LAST_VALUE',
		'LAG',
		'LEAD',
		'LISTAGG',
		'MAX',
		'MEDIAN',
		'MIN',
		'NTH_VALUE',
		'NTILE',
		'PERCENT_RANK',
		'PERCENTILE_CONT',
		'PERCENTILE_DISC',
		'RANK',
		'RATIO_TO_REPORT',
		'ROW_NUMBER',
		'STDDEV_SAMP',
		'STDDEV_POP',
		'SUM',
		'VAR_SAMP',
		'VAR_POP',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/r_Data_type_formatting.html
	dataType: [
		'CAST',
		'CONVERT',
		'TO_CHAR',
		'TO_DATE',
		'TO_NUMBER',
		'TEXT_TO_INT_ALT',
		'TEXT_TO_NUMERIC_ALT',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/r_System_administration_functions.html
	sysAdmin: [
		'CHANGE_QUERY_PRIORITY',
		'CHANGE_SESSION_PRIORITY',
		'CHANGE_USER_PRIORITY',
		'CURRENT_SETTING',
		'PG_CANCEL_BACKEND',
		'PG_TERMINATE_BACKEND',
		'REBOOT_CLUSTER',
		'SET_CONFIG',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/r_System_information_functions.html
	sysInfo: [
		'CURRENT_AWS_ACCOUNT',
		'CURRENT_DATABASE',
		'CURRENT_NAMESPACE',
		'CURRENT_SCHEMA',
		'CURRENT_SCHEMAS',
		'CURRENT_USER',
		'CURRENT_USER_ID',
		'HAS_ASSUMEROLE_PRIVILEGE',
		'HAS_DATABASE_PRIVILEGE',
		'HAS_SCHEMA_PRIVILEGE',
		'HAS_TABLE_PRIVILEGE',
		'PG_BACKEND_PID',
		'PG_GET_COLS',
		'PG_GET_GRANTEE_BY_IAM_ROLE',
		'PG_GET_IAM_ROLE_BY_USER',
		'PG_GET_LATE_BINDING_VIEW_COLS',
		'PG_LAST_COPY_COUNT',
		'PG_LAST_COPY_ID',
		'PG_LAST_UNLOAD_ID',
		'PG_LAST_QUERY_ID',
		'PG_LAST_UNLOAD_COUNT',
		'SESSION_USER',
		'SLICE_NUM',
		'USER',
		'VERSION',
	],
};

const reservedKeywords = {
	// https://docs.aws.amazon.com/redshift/latest/dg/r_pg_keywords.html
	// duplicates are removed in favour of more specific categories
	standard: [
		'AES128',
		'AES256',
		'ALL',
		'ALLOWOVERWRITE',
		'ANY',
		'ARRAY',
		'AS',
		'ASC',
		'AUTHORIZATION',
		'BACKUP',
		'BETWEEN',
		'BINARY',
		'BOTH',
		'CHECK',
		'COLUMN',
		'CONSTRAINT',
		'CREATE',
		'CROSS',
		'DEFAULT',
		'DEFERRABLE',
		'DEFLATE',
		'DEFRAG',
		'DESC',
		'DISABLE',
		'DISTINCT',
		'DO',
		'ENABLE',
		'ENCODE',
		'ENCRYPT',
		'ENCRYPTION',
		'EXPLICIT',
		'FALSE',
		'FOR',
		'FOREIGN',
		'FREEZE',
		'FROM',
		'FULL',
		'GLOBALDICT256',
		'GLOBALDICT64K',
		'GROUP',
		'IDENTITY',
		'IGNORE',
		'ILIKE',
		'IN',
		'INITIALLY',
		'INNER',
		'INTO',
		'IS',
		'ISNULL',
		'LANGUAGE',
		'LEADING',
		'LIKE',
		'LIMIT',
		'LOCALTIME',
		'LOCALTIMESTAMP',
		'LUN',
		'LUNS',
		'MINUS',
		'NATURAL',
		'NEW',
		'NOT',
		'NOTNULL',
		'NULL',
		'NULLS',
		'OFF',
		'OFFLINE',
		'OFFSET',
		'OID',
		'OLD',
		'ONLY',
		'OPEN',
		'ORDER',
		'OUTER',
		'OVERLAPS',
		'PARALLEL',
		'PARTITION',
		'PERCENT',
		'PERMISSIONS',
		'PLACING',
		'PRIMARY',
		'RECOVER',
		'REFERENCES',
		'REJECTLOG',
		'RESORT',
		'RESPECT',
		'RESTORE',
		'SIMILAR',
		'SNAPSHOT',
		'SOME',
		'SYSTEM',
		'TABLE',
		'TAG',
		'TDES',
		'TIMESTAMP',
		'TO',
		'TOP',
		'TRAILING',
		'TRUE',
		'UNIQUE',
		'USING',
		'VERBOSE',
		'WALLET',
		'WITHOUT',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-conversion.html
	dataConversionParams: [
		'ACCEPTANYDATE',
		'ACCEPTINVCHARS',
		'BLANKSASNULL',
		'DATEFORMAT',
		'EMPTYASNULL',
		'ENCODING',
		'ESCAPE',
		'EXPLICIT_IDS',
		'FILLRECORD',
		'IGNOREBLANKLINES',
		'IGNOREHEADER',
		'NULL AS',
		'REMOVEQUOTES',
		'ROUNDEC',
		'TIMEFORMAT',
		'TRIMBLANKS',
		'TRUNCATECOLUMNS',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-load.html
	dataLoadParams: ['COMPROWS', 'COMPUPDATE', 'MAXERROR', 'NOLOAD', 'STATUPDATE'],
	// https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-format.html
	dataFormatParams: [
		'FORMAT',
		'CSV',
		'DELIMITER',
		'FIXEDWIDTH',
		'SHAPEFILE',
		'AVRO',
		'JSON',
		'PARQUET',
		'ORC',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-authorization.html
	copyAuthParams: [
		'ACCESS_KEY_ID',
		'CREDENTIALS',
		'ENCRYPTED',
		'IAM_ROLE',
		'MASTER_SYMMETRIC_KEY',
		'SECRET_ACCESS_KEY',
		'SESSION_TOKEN',
	],
	// https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-file-compression.html
	copyCompressionParams: ['BZIP2', 'GZIP', 'LZOP', 'ZSTD'],
	// https://docs.aws.amazon.com/redshift/latest/dg/r_COPY-alphabetical-parm-list.html
	copyMiscParams: ['MANIFEST', 'READRATIO', 'REGION', 'SSH'],
	// https://docs.aws.amazon.com/redshift/latest/dg/c_Compression_encodings.html
	compressionEncodings: [
		'RAW',
		'AZ64',
		'BYTEDICT',
		'DELTA',
		'DELTA32K',
		'LZO',
		'MOSTLY8',
		'MOSTLY16',
		'MOSTLY32',
		'RUNLENGTH',
		'TEXT255',
		'TEXT32K',
	],
	misc: [
		// CREATE EXTERNAL SCHEMA (https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html)
		'CATALOG_ROLE',
		'SECRET_ARN',
		'EXTERNAL',
		'HIVE METASTORE', // https://docs.aws.amazon.com/redshift/latest/dg/c-spectrum-external-schemas.html
		// https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html
		'AUTO',
		'EVEN',
		'KEY',
		'PREDICATE', // ANALYZE | ANALYSE (https://docs.aws.amazon.com/redshift/latest/dg/r_ANALYZE.html)
		// unknown
		'COMPRESSION',
		'DATA CATALOG',
	],
	/**
	 * Other keywords not included:
	 * STL: https://docs.aws.amazon.com/redshift/latest/dg/c_intro_STL_tables.html
	 * SVCS: https://docs.aws.amazon.com/redshift/latest/dg/svcs_views.html
	 * SVL: https://docs.aws.amazon.com/redshift/latest/dg/svl_views.html
	 * SVV: https://docs.aws.amazon.com/redshift/latest/dg/svv_views.html
	 */
	dataTypes: [
		'CHAR',
		'CHARACTER',
		'NCHAR',
		'VARCHAR',
		'CHARACTER VARYING',
		'NVARCHAR',
		'BPCHAR',
		'TEXT',
	],
};

// https://docs.aws.amazon.com/redshift/latest/dg/c_SQL_commands.html
const reservedCommands = [
	'ABORT',
	'ALTER DATABASE',
	'ALTER DATASHARE',
	'ALTER DEFAULT PRIVILEGES',
	'ALTER GROUP',
	'ALTER MATERIALIZED VIEW',
	'ALTER PROCEDURE',
	'ALTER SCHEMA',
	'ALTER TABLE',
	'ALTER TABLE APPEND',
	'ALTER USER',
	'ANALYSE',
	'ANALYZE',
	'ANALYSE COMPRESSION',
	'ANALYZE COMPRESSION',
	'BEGIN',
	'CALL',
	'CANCEL',
	'CLOSE',
	'COMMENT',
	'COMMIT',
	'COPY',
	'CREATE DATABASE',
	'CREATE DATASHARE',
	'CREATE EXTERNAL FUNCTION',
	'CREATE EXTERNAL SCHEMA',
	'CREATE EXTERNAL TABLE',
	'CREATE FUNCTION',
	'CREATE GROUP',
	'CREATE LIBRARY',
	'CREATE MATERIALIZED VIEW',
	'CREATE MODEL',
	'CREATE PROCEDURE',
	'CREATE SCHEMA',
	'CREATE TABLE',
	'CREATE TABLE AS',
	'CREATE USER',
	'CREATE VIEW',
	'DEALLOCATE',
	'DECLARE',
	'DELETE',
	'DESC DATASHARE',
	'DROP DATABASE',
	'DROP DATASHARE',
	'DROP FUNCTION',
	'DROP GROUP',
	'DROP LIBRARY',
	'DROP MODEL',
	'DROP MATERIALIZED VIEW',
	'DROP PROCEDURE',
	'DROP SCHEMA',
	'DROP TABLE',
	'DROP USER',
	'DROP VIEW',
	'DROP',
	'END',
	'EXECUTE',
	'EXPLAIN',
	'FETCH',
	'FROM',
	'GRANT',
	'HAVING',
	'INSERT',
	'LOCK',
	'PREPARE',
	'REFRESH MATERIALIZED VIEW',
	'RESET',
	'REVOKE',
	'ROLLBACK',
	'SELECT',
	'SELECT INTO',
	'SET',
	'SET SESSION AUTHORIZATION',
	'SET SESSION CHARACTERISTICS',
	'SHOW',
	'SHOW EXTERNAL TABLE',
	'SHOW MODEL',
	'SHOW DATASHARES',
	'SHOW PROCEDURE',
	'SHOW TABLE',
	'SHOW VIEW',
	'START TRANSACTION',
	'TRUNCATE',
	'UNLOAD',
	'UPDATE',
	'VACUUM',
	'WHERE',
	'WITH',
	// other
	'GROUP BY',
	'ORDER BY',
	'LIMIT',
	'OFFSET',
	'VALUES',
	'MODIFY', // verify
	'INSERT INTO', // verify
	'ALTER COLUMN', // verify
	'SET SCHEMA', // verify
];

const reservedBinaryCommands = [
	'INTERSECT',
	'INTERSECT ALL',
	'INTERSECT DISTINCT',
	'UNION',
	'UNION ALL',
	'UNION DISTINCT',
	'EXCEPT',
	'EXCEPT ALL',
	'EXCEPT DISTINCT',
	// joins
	'JOIN',
	'INNER JOIN',
	'LEFT JOIN',
	'LEFT OUTER JOIN',
	'RIGHT JOIN',
	'RIGHT OUTER JOIN',
	'FULL JOIN',
	'FULL OUTER JOIN',
	'CROSS JOIN',
	'NATURAL JOIN',
];

/**
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['ON', 'WHEN', 'THEN', 'ELSE'];

const reservedLogicalOperators = ['AND', 'OR'];

// https://docs.aws.amazon.com/redshift/latest/dg/cm_chap_SQLCommandRef.html
export default class RedshiftFormatter extends Formatter {
	fullReservedWords = [
		...Object.values(reservedFunctions).reduce((acc, arr) => [...acc, ...arr], []),
		...Object.values(reservedKeywords).reduce((acc, arr) => [...acc, ...arr], []),
	];

	tokenizer() {
		return new Tokenizer({
			reservedKeywords: this.fullReservedWords,
			reservedCommands,
			reservedLogicalOperators,
			reservedDependentClauses,
			reservedBinaryCommands,
			stringTypes: [`""`, "''", '``'],
			blockStart: ['('],
			closeParens: [')'],
			indexedPlaceholderTypes: ['?'],
			namedPlaceholderTypes: ['@', '#', '$'],
			lineCommentTypes: ['--'],
			operators: ['|/', '||/', '<<', '>>', '!=', '||'],
		});
	}
}
