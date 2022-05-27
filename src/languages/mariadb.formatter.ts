import Formatter from '../core/Formatter';
import Tokenizer from '../core/Tokenizer';
import { EOF_TOKEN, isToken, Token, TokenType } from '../core/token';
import { dedupe } from '../utils';

/**
 * Priority 5 (last)
 * Full list of reserved functions
 * distinct from Keywords due to interaction with parentheses
 */
// https://mariadb.com/kb/en/information-schema-sql_functions-table/
const reservedFunctions = [
  'ADDDATE',
  'ADD_MONTHS',
  'BIT_AND',
  'BIT_OR',
  'BIT_XOR',
  'CAST',
  'COUNT',
  'CUME_DIST',
  'CURDATE',
  'CURTIME',
  'DATE_ADD',
  'DATE_SUB',
  'DATE_FORMAT',
  'DECODE',
  'DENSE_RANK',
  'EXTRACT',
  'FIRST_VALUE',
  'GROUP_CONCAT',
  'JSON_ARRAYAGG',
  'JSON_OBJECTAGG',
  'LAG',
  'LEAD',
  'MAX',
  'MEDIAN',
  'MID',
  'MIN',
  'NOW',
  'NTH_VALUE',
  'NTILE',
  'POSITION',
  'PERCENT_RANK',
  'PERCENTILE_CONT',
  'PERCENTILE_DISC',
  'RANK',
  'ROW_NUMBER',
  'SESSION_USER',
  'STD',
  'STDDEV',
  'STDDEV_POP',
  'STDDEV_SAMP',
  'SUBDATE',
  'SUBSTR',
  'SUBSTRING',
  'SUM',
  'SYSTEM_USER',
  'TRIM',
  'TRIM_ORACLE',
  'VARIANCE',
  'VAR_POP',
  'VAR_SAMP',
  'ABS',
  'ACOS',
  'ADDTIME',
  'AES_DECRYPT',
  'AES_ENCRYPT',
  'ASIN',
  'ATAN',
  'ATAN2',
  'BENCHMARK',
  'BIN',
  'BINLOG_GTID_POS',
  'BIT_COUNT',
  'BIT_LENGTH',
  'CEIL',
  'CEILING',
  'CHARACTER_LENGTH',
  'CHAR_LENGTH',
  'CHR',
  'COERCIBILITY',
  'COLUMN_CHECK',
  'COLUMN_EXISTS',
  'COLUMN_LIST',
  'COLUMN_JSON',
  'COMPRESS',
  'CONCAT',
  'CONCAT_OPERATOR_ORACLE',
  'CONCAT_WS',
  'CONNECTION_ID',
  'CONV',
  'CONVERT_TZ',
  'COS',
  'COT',
  'CRC32',
  'DATEDIFF',
  'DAYNAME',
  'DAYOFMONTH',
  'DAYOFWEEK',
  'DAYOFYEAR',
  'DEGREES',
  'DECODE_HISTOGRAM',
  'DECODE_ORACLE',
  'DES_DECRYPT',
  'DES_ENCRYPT',
  'ELT',
  'ENCODE',
  'ENCRYPT',
  'EXP',
  'EXPORT_SET',
  'EXTRACTVALUE',
  'FIELD',
  'FIND_IN_SET',
  'FLOOR',
  'FORMAT',
  'FOUND_ROWS',
  'FROM_BASE64',
  'FROM_DAYS',
  'FROM_UNIXTIME',
  'GET_LOCK',
  'GREATEST',
  'HEX',
  'IFNULL',
  'INSTR',
  'ISNULL',
  'IS_FREE_LOCK',
  'IS_USED_LOCK',
  'JSON_ARRAY',
  'JSON_ARRAY_APPEND',
  'JSON_ARRAY_INSERT',
  'JSON_COMPACT',
  'JSON_CONTAINS',
  'JSON_CONTAINS_PATH',
  'JSON_DEPTH',
  'JSON_DETAILED',
  'JSON_EXISTS',
  'JSON_EXTRACT',
  'JSON_INSERT',
  'JSON_KEYS',
  'JSON_LENGTH',
  'JSON_LOOSE',
  'JSON_MERGE',
  'JSON_MERGE_PATCH',
  'JSON_MERGE_PRESERVE',
  'JSON_QUERY',
  'JSON_QUOTE',
  'JSON_OBJECT',
  'JSON_REMOVE',
  'JSON_REPLACE',
  'JSON_SET',
  'JSON_SEARCH',
  'JSON_TYPE',
  'JSON_UNQUOTE',
  'JSON_VALID',
  'JSON_VALUE',
  'LAST_DAY',
  'LAST_INSERT_ID',
  'LCASE',
  'LEAST',
  'LENGTH',
  'LENGTHB',
  'LN',
  'LOAD_FILE',
  'LOCATE',
  'LOG',
  'LOG10',
  'LOG2',
  'LOWER',
  'LPAD',
  'LPAD_ORACLE',
  'LTRIM',
  'LTRIM_ORACLE',
  'MAKEDATE',
  'MAKETIME',
  'MAKE_SET',
  'MASTER_GTID_WAIT',
  'MASTER_POS_WAIT',
  'MD5',
  'MONTHNAME',
  'NAME_CONST',
  'NVL',
  'NVL2',
  'NULLIF',
  'OCT',
  'OCTET_LENGTH',
  'ORD',
  'PERIOD_ADD',
  'PERIOD_DIFF',
  'PI',
  'POW',
  'POWER',
  'QUOTE',
  'REGEXP_INSTR',
  'REGEXP_REPLACE',
  'REGEXP_SUBSTR',
  'RADIANS',
  'RAND',
  'RELEASE_ALL_LOCKS',
  'RELEASE_LOCK',
  'REPLACE_ORACLE',
  'REVERSE',
  'ROUND',
  'RPAD',
  'RPAD_ORACLE',
  'RTRIM',
  'RTRIM_ORACLE',
  'SEC_TO_TIME',
  'SHA',
  'SHA1',
  'SHA2',
  'SIGN',
  'SIN',
  'SLEEP',
  'SOUNDEX',
  'SPACE',
  'SQRT',
  'STRCMP',
  'STR_TO_DATE',
  'SUBSTR_ORACLE',
  'SUBSTRING_INDEX',
  'SUBTIME',
  'SYS_GUID',
  'TAN',
  'TIMEDIFF',
  'TIME_FORMAT',
  'TIME_TO_SEC',
  'TO_BASE64',
  'TO_CHAR',
  'TO_DAYS',
  'TO_SECONDS',
  'UCASE',
  'UNCOMPRESS',
  'UNCOMPRESSED_LENGTH',
  'UNHEX',
  'UNIX_TIMESTAMP',
  'UPDATEXML',
  'UPPER',
  'UUID',
  'UUID_SHORT',
  'VERSION',
  'WEEKDAY',
  'WEEKOFYEAR',
  'WSREP_LAST_WRITTEN_GTID',
  'WSREP_LAST_SEEN_GTID',
  'WSREP_SYNC_WAIT_UPTO_GTID',
  'YEARWEEK',
];

/**
 * Priority 5 (last)
 * Full list of reserved words
 * any words that are in a higher priority are removed
 */
// https://mariadb.com/kb/en/information-schema-keywords-table/
const reservedKeywords = [
  'ACCESSIBLE',
  'ACCOUNT',
  'ACTION',
  'ADMIN',
  'AFTER',
  'AGAINST',
  'AGGREGATE',
  'ALL',
  'ALGORITHM',
  'ALTER',
  'ALWAYS',
  'ANY',
  'AS',
  'ASC',
  'ASCII',
  'ASENSITIVE',
  'AT',
  'ATOMIC',
  'AUTHORS',
  'AUTO_INCREMENT',
  'AUTOEXTEND_SIZE',
  'AUTO',
  'AVG',
  'AVG_ROW_LENGTH',
  'BACKUP',
  'BEFORE',
  'BETWEEN',
  'BIGINT',
  'BINARY',
  'BIT',
  'BLOB',
  'BLOCK',
  'BODY',
  'BOOL',
  'BOOLEAN',
  'BOTH',
  'BTREE',
  'BY',
  'BYTE',
  'CACHE',
  'CASCADE',
  'CASCADED',
  'CATALOG_NAME',
  'CHAIN',
  'CHANGE',
  'CHANGED',
  'CHAR',
  'CHARACTER',
  'CHARACTER SET',
  'CHARSET',
  'CHECK',
  'CHECKPOINT',
  'CHECKSUM',
  'CIPHER',
  'CLASS_ORIGIN',
  'CLIENT',
  'CLOB',
  'CLOSE',
  'COALESCE',
  'CODE',
  'COLLATE',
  'COLLATION',
  'COLUMN',
  'COLUMN_NAME',
  'COLUMNS',
  'COLUMN_ADD',
  'COLUMN_CREATE',
  'COLUMN_DELETE',
  'COLUMN_GET',
  'COMMENT',
  'COMMITTED',
  'COMPACT',
  'COMPLETION',
  'COMPRESSED',
  'CONCURRENT',
  'CONDITION',
  'CONNECTION',
  'CONSISTENT',
  'CONSTRAINT',
  'CONSTRAINT_CATALOG',
  'CONSTRAINT_NAME',
  'CONSTRAINT_SCHEMA',
  'CONTAINS',
  'CONTEXT',
  'CONTINUE',
  'CONTRIBUTORS',
  'CONVERT',
  'CPU',
  'CREATE',
  'CROSS',
  'CUBE',
  'CURRENT',
  'CURRENT_DATE',
  'CURRENT_POS',
  'CURRENT_ROLE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'CURRENT_USER',
  'CURSOR',
  'CURSOR_NAME',
  'CYCLE',
  'DATA',
  'DATABASE',
  'DATABASES',
  'DATAFILE',
  'DATE',
  'DATETIME',
  'DAY',
  'DAY_HOUR',
  'DAY_MICROSECOND',
  'DAY_MINUTE',
  'DAY_SECOND',
  'DEALLOCATE',
  'DEC',
  'DECIMAL',
  'DECLARE',
  'DEFAULT',
  'DEFINER',
  'DELAYED',
  'DELAY_KEY_WRITE',
  'DELETE_DOMAIN_ID',
  'DES_KEY_FILE',
  'DETERMINISTIC',
  'DIAGNOSTICS',
  'DIRECTORY',
  'DISABLE',
  'DISCARD',
  'DISK',
  'DISTINCT',
  'DISTINCTROW',
  'DIV',
  'DOUBLE',
  'DO_DOMAIN_IDS',
  'DROP',
  'DUAL',
  'DUMPFILE',
  'DUPLICATE',
  'DYNAMIC',
  'EACH',
  'EMPTY',
  'ENABLE',
  'ENCLOSED',
  'ENDS',
  'ENGINE',
  'ENGINES',
  'ENUM',
  'ERROR',
  'ERRORS',
  'ESCAPE',
  'ESCAPED',
  'EVENT',
  'EVENTS',
  'EVERY',
  'EXAMINED',
  'EXCHANGE',
  'EXCLUDE',
  'EXCEPTION',
  'EXISTS',
  'EXIT',
  'EXPANSION',
  'EXPIRE',
  'EXPORT',
  'EXTENDED',
  'EXTENT_SIZE',
  'FALSE',
  'FAST',
  'FAULTS',
  'FEDERATED',
  'FETCH',
  'FIELDS',
  'FILE',
  'FIRST',
  'FIXED',
  'FLOAT',
  'FLOAT4',
  'FLOAT8',
  'FOLLOWING',
  'FOLLOWS',
  'FOR',
  'FORCE',
  'FOREIGN',
  'FOUND',
  'FULL',
  'FULLTEXT',
  'FUNCTION',
  'GENERAL',
  'GENERATED',
  'GET_FORMAT',
  'GET',
  'GLOBAL',
  'GOTO',
  'GRANTS',
  'GROUP',
  'HARD',
  'HASH',
  'HIGH_PRIORITY',
  'HISTORY',
  'HOST',
  'HOSTS',
  'HOUR',
  'HOUR_MICROSECOND',
  'HOUR_MINUTE',
  'HOUR_SECOND',
  // 'ID',
  'IDENTIFIED',
  'IF',
  'IGNORE',
  'IGNORED',
  'IGNORE_DOMAIN_IDS',
  'IGNORE_SERVER_IDS',
  'IMMEDIATE',
  'IMPORT',
  'IN',
  'INCREMENT',
  'INDEX',
  'INDEXES',
  'INFILE',
  'INITIAL_SIZE',
  'INNER',
  'INOUT',
  'INSENSITIVE',
  'INSERT_METHOD',
  'INSTALL',
  'INT',
  'INT1',
  'INT2',
  'INT3',
  'INT4',
  'INT8',
  'INTEGER',
  'INTERVAL',
  'INVISIBLE',
  'INTO',
  'IO',
  'IO_THREAD',
  'IPC',
  'IS',
  'ISOLATION',
  'ISOPEN',
  'ISSUER',
  'ITERATE',
  'INVOKER',
  'JSON',
  'JSON_TABLE',
  'KEY',
  'KEYS',
  'KEY_BLOCK_SIZE',
  'LANGUAGE',
  'LAST',
  'LAST_VALUE',
  'LASTVAL',
  'LEADING',
  'LEAVE',
  'LEAVES',
  'LEFT',
  'LESS',
  'LEVEL',
  'LIKE',
  'LINEAR',
  'LINES',
  'LIST',
  'LOAD',
  'LOCAL',
  'LOCALTIME',
  'LOCALTIMESTAMP',
  'LOCK',
  'LOCKED',
  'LOCKS',
  'LOGFILE',
  'LOGS',
  'LONG',
  'LONGBLOB',
  'LONGTEXT',
  'LOOP',
  'LOW_PRIORITY',
  'MASTER',
  'MASTER_CONNECT_RETRY',
  'MASTER_DELAY',
  'MASTER_GTID_POS',
  'MASTER_HOST',
  'MASTER_LOG_FILE',
  'MASTER_LOG_POS',
  'MASTER_PASSWORD',
  'MASTER_PORT',
  'MASTER_SERVER_ID',
  'MASTER_SSL',
  'MASTER_SSL_CA',
  'MASTER_SSL_CAPATH',
  'MASTER_SSL_CERT',
  'MASTER_SSL_CIPHER',
  'MASTER_SSL_CRL',
  'MASTER_SSL_CRLPATH',
  'MASTER_SSL_KEY',
  'MASTER_SSL_VERIFY_SERVER_CERT',
  'MASTER_USER',
  'MASTER_USE_GTID',
  'MASTER_HEARTBEAT_PERIOD',
  'MATCH',
  'MAX_CONNECTIONS_PER_HOUR',
  'MAX_QUERIES_PER_HOUR',
  'MAX_ROWS',
  'MAX_SIZE',
  'MAX_STATEMENT_TIME',
  'MAX_UPDATES_PER_HOUR',
  'MAX_USER_CONNECTIONS',
  'MAXVALUE',
  'MEDIUM',
  'MEDIUMBLOB',
  'MEDIUMINT',
  'MEDIUMTEXT',
  'MEMORY',
  'MERGE',
  'MESSAGE_TEXT',
  'MICROSECOND',
  'MIDDLEINT',
  'MIGRATE',
  'MINUS',
  'MINUTE',
  'MINUTE_MICROSECOND',
  'MINUTE_SECOND',
  'MINVALUE',
  'MIN_ROWS',
  'MOD',
  'MODE',
  'MODIFIES',
  'MODIFY',
  'MONITOR',
  'MONTH',
  'MUTEX',
  'MYSQL',
  'MYSQL_ERRNO',
  'NAME',
  'NAMES',
  'NATIONAL',
  'NATURAL',
  'NCHAR',
  'NESTED',
  'NEVER',
  'NEW',
  'NEXT',
  'NEXTVAL',
  'NO',
  'NOMAXVALUE',
  'NOMINVALUE',
  'NOCACHE',
  'NOCYCLE',
  'NO_WAIT',
  'NOWAIT',
  'NODEGROUP',
  'NONE',
  'NOT',
  'NOTFOUND',
  'NO_WRITE_TO_BINLOG',
  'NULL',
  'NUMBER',
  'NUMERIC',
  'NVARCHAR',
  'OF',
  'OFFSET',
  'OLD_PASSWORD',
  'ON DELETE',
  'ON UPDATE',
  'ONE',
  'ONLINE',
  'ONLY',
  'OPEN',
  'OPTIMIZE',
  'OPTIONS',
  'OPTION',
  'OPTIONALLY',
  'ORDER',
  'ORDINALITY',
  'OTHERS',
  'OUT',
  'OUTER',
  'OUTFILE',
  'OVER',
  'OVERLAPS',
  'OWNER',
  'PACKAGE',
  'PACK_KEYS',
  'PAGE',
  'PAGE_CHECKSUM',
  'PARSER',
  'PARSE_VCOL_EXPR',
  'PATH',
  'PERIOD',
  'PARTIAL',
  'PARTITION',
  'PARTITIONING',
  'PARTITIONS',
  'PASSWORD',
  'PERSISTENT',
  'PHASE',
  'PLUGIN',
  'PLUGINS',
  'PORT',
  'PORTION',
  'PRECEDES',
  'PRECEDING',
  'PRECISION',
  'PRESERVE',
  'PREV',
  'PREVIOUS',
  'PRIMARY',
  'PRIVILEGES',
  'PROCEDURE',
  'PROCESS',
  'PROCESSLIST',
  'PROFILE',
  'PROFILES',
  'PROXY',
  'PURGE',
  'QUARTER',
  'QUERY',
  'QUICK',
  'RAISE',
  'RANGE',
  'RAW',
  'READ',
  'READ_ONLY',
  'READ_WRITE',
  'READS',
  'REAL',
  'REBUILD',
  'RECOVER',
  'RECURSIVE',
  'REDO_BUFFER_SIZE',
  'REDOFILE',
  'REDUNDANT',
  'REFERENCES',
  'REGEXP',
  'RELAY',
  'RELAYLOG',
  'RELAY_LOG_FILE',
  'RELAY_LOG_POS',
  'RELAY_THREAD',
  'RELEASE',
  'RELOAD',
  'REMOVE',
  'RENAME',
  'REORGANIZE',
  'REPAIR',
  'REPEATABLE',
  'REPLAY',
  'REPLICA',
  'REPLICAS',
  'REPLICA_POS',
  'REPLICATION',
  'REPEAT',
  'REQUIRE',
  'RESET',
  'RESTART',
  'RESTORE',
  'RESTRICT',
  'RESUME',
  'RETURNED_SQLSTATE',
  'RETURN',
  'RETURNS',
  'REUSE',
  'RIGHT',
  'RLIKE',
  'ROLE',
  'ROLLUP',
  'ROUTINE',
  'ROW',
  'ROWCOUNT',
  'ROWNUM',
  'ROWS',
  'ROWTYPE',
  'ROW_COUNT',
  'ROW_FORMAT',
  'RTREE',
  'SCHEDULE',
  'SCHEMA',
  'SCHEMA_NAME',
  'SCHEMAS',
  'SECOND',
  'SECOND_MICROSECOND',
  'SECURITY',
  'SENSITIVE',
  'SEPARATOR',
  'SEQUENCE',
  'SERIAL',
  'SERIALIZABLE',
  'SESSION',
  'SERVER',
  'SETVAL',
  'SHARE',
  'SIGNED',
  'SIMPLE',
  'SKIP',
  'SLAVE',
  'SLAVES',
  'SLAVE_POS',
  'SLOW',
  'SNAPSHOT',
  'SMALLINT',
  'SOCKET',
  'SOFT',
  'SOME',
  'SONAME',
  'SOUNDS',
  'SOURCE',
  'STAGE',
  'STORED',
  'SPATIAL',
  'SPECIFIC',
  'REF_SYSTEM_ID',
  'SQL',
  'SQLEXCEPTION',
  'SQLSTATE',
  'SQLWARNING',
  'SQL_BIG_RESULT',
  'SQL_BUFFER_RESULT',
  'SQL_CACHE',
  'SQL_CALC_FOUND_ROWS',
  'SQL_NO_CACHE',
  'SQL_SMALL_RESULT',
  'SQL_THREAD',
  'SQL_TSI_SECOND',
  'SQL_TSI_MINUTE',
  'SQL_TSI_HOUR',
  'SQL_TSI_DAY',
  'SQL_TSI_WEEK',
  'SQL_TSI_MONTH',
  'SQL_TSI_QUARTER',
  'SQL_TSI_YEAR',
  'SSL',
  'START',
  'STARTING',
  'STARTS',
  'STATEMENT',
  'STATS_AUTO_RECALC',
  'STATS_PERSISTENT',
  'STATS_SAMPLE_PAGES',
  'STATUS',
  'STOP',
  'STORAGE',
  'STRING',
  'SUBCLASS_ORIGIN',
  'SUBJECT',
  'SUBPARTITION',
  'SUBPARTITIONS',
  'SUPER',
  'SUSPEND',
  'SWAPS',
  'SWITCHES',
  'SYSDATE',
  'SYSTEM',
  'SYSTEM_TIME',
  'TABLE',
  'TABLE_NAME',
  'TABLES',
  'TABLESPACE',
  'TABLE_CHECKSUM',
  'TEMPORARY',
  'TEMPTABLE',
  'TERMINATED',
  'TEXT',
  'THAN',
  'THEN',
  'TIES',
  'TIME',
  'TIMESTAMP',
  'TIMESTAMPADD',
  'TIMESTAMPDIFF',
  'TINYBLOB',
  'TINYINT',
  'TINYTEXT',
  'TO',
  'TRAILING',
  'TRANSACTION',
  'TRANSACTIONAL',
  'THREADS',
  'TRIGGER',
  'TRIGGERS',
  'TRUE',
  'TYPE',
  'TYPES',
  'UNBOUNDED',
  'UNCOMMITTED',
  'UNDEFINED',
  'UNDO_BUFFER_SIZE',
  'UNDOFILE',
  'UNDO',
  'UNICODE',
  'UNIQUE',
  'UNKNOWN',
  'UNLOCK',
  'UNINSTALL',
  'UNSIGNED',
  'UNTIL',
  'UPGRADE',
  'USAGE',
  'USER',
  'USER_RESOURCES',
  'USE_FRM',
  'UTC_DATE',
  'UTC_TIME',
  'UTC_TIMESTAMP',
  'VALUE',
  'VARBINARY',
  'VARCHAR',
  'VARCHARACTER',
  'VARCHAR2',
  'VARIABLES',
  'VARYING',
  'VIA',
  'VIEW',
  'VIRTUAL',
  'VISIBLE',
  'VERSIONING',
  'WAIT',
  'WARNINGS',
  'WEEK',
  'WEIGHT_STRING',
  'WHILE',
  'WINDOW',
  'WITHIN',
  'WITHOUT',
  'WORK',
  'WRAPPER',
  'WRITE',
  'X509',
  'XA',
  'XML',
  'YEAR',
  'YEAR_MONTH',
  'ZEROFILL',
];

/**
 * Priority 1 (first)
 * keywords that begin a new statement
 * will begin new indented block
 */
// https://mariadb.com/docs/reference/mdb/sql-statements/
const reservedCommands = [
  'ALTER DATABASE',
  'ALTER DATABASE COMMENT',
  'ALTER EVENT',
  'ALTER FUNCTION',
  'ALTER PROCEDURE',
  'ALTER SCHEMA',
  'ALTER SCHEMA COMMENT',
  'ALTER SEQUENCE',
  'ALTER SERVER',
  'ALTER TABLE',
  'ALTER USER',
  'ALTER VIEW',
  'ANALYZE',
  'ANALYZE TABLE',
  'BACKUP LOCK',
  'BACKUP STAGE',
  'BACKUP UNLOCK',
  'BEGIN',
  'BINLOG',
  'CACHE INDEX',
  'CALL',
  'CHANGE MASTER TO',
  'CHECK TABLE',
  'CHECK VIEW',
  'CHECKSUM TABLE',
  'COMMIT',
  'CREATE AGGREGATE FUNCTION',
  'CREATE DATABASE',
  'CREATE EVENT',
  'CREATE FUNCTION',
  'CREATE INDEX',
  'CREATE PROCEDURE',
  'CREATE ROLE',
  'CREATE SEQUENCE',
  'CREATE SERVER',
  'CREATE SPATIAL INDEX',
  'CREATE TABLE',
  'CREATE TRIGGER',
  'CREATE UNIQUE INDEX',
  'CREATE USER',
  'CREATE VIEW',
  'DEALLOCATE PREPARE',
  'DELETE',
  'DELETE FROM',
  'DESC',
  'DESCRIBE',
  'DO',
  'DROP DATABASE',
  'DROP EVENT',
  'DROP FUNCTION',
  'DROP INDEX',
  'DROP PREPARE',
  'DROP PROCEDURE',
  'DROP ROLE',
  'DROP SEQUENCE',
  'DROP SERVER',
  'DROP TABLE',
  'DROP TRIGGER',
  'DROP USER',
  'DROP VIEW',
  'EXECUTE',
  'EXPLAIN',
  'FLUSH',
  'GET DIAGNOSTICS',
  'GET DIAGNOSTICS CONDITION',
  'GRANT',
  'HANDLER',
  'HELP',
  'INSERT',
  'INSTALL PLUGIN',
  'INSTALL SONAME',
  'KILL',
  'LOAD DATA INFILE',
  'LOAD INDEX INTO CACHE',
  'LOAD XML INFILE',
  'LOCK TABLE',
  'OPTIMIZE TABLE',
  'PREPARE',
  'PURGE BINARY LOGS',
  'PURGE MASTER LOGS',
  'RELEASE SAVEPOINT',
  'RENAME TABLE',
  'RENAME USER',
  'REPAIR TABLE',
  'REPAIR VIEW',
  'REPLACE',
  'RESET MASTER',
  'RESET QUERY CACHE',
  'RESET REPLICA',
  'RESET SLAVE',
  'RESIGNAL',
  'RETURNING',
  'REVOKE',
  'ROLLBACK',
  'SAVEPOINT',
  'SELECT',
  'SET',
  'SET CHARACTER SET',
  'SET DEFAULT ROLE',
  'SET GLOBAL TRANSACTION',
  'SET NAMES',
  'SET PASSWORD',
  'SET ROLE',
  'SET STATEMENT',
  'SET TRANSACTION',
  'SHOW',
  'SHOW ALL REPLICAS STATUS',
  'SHOW ALL SLAVES STATUS',
  'SHOW AUTHORS',
  'SHOW BINARY LOGS',
  'SHOW BINLOG EVENTS',
  'SHOW BINLOG STATUS',
  'SHOW CHARACTER SET',
  'SHOW CLIENT_STATISTICS',
  'SHOW COLLATION',
  'SHOW COLUMNS',
  'SHOW CONTRIBUTORS',
  'SHOW CREATE DATABASE',
  'SHOW CREATE EVENT',
  'SHOW CREATE FUNCTION',
  'SHOW CREATE PACKAGE',
  'SHOW CREATE PACKAGE BODY',
  'SHOW CREATE PROCEDURE',
  'SHOW CREATE SEQUENCE',
  'SHOW CREATE TABLE',
  'SHOW CREATE TRIGGER',
  'SHOW CREATE USER',
  'SHOW CREATE VIEW',
  'SHOW DATABASES',
  'SHOW ENGINE',
  'SHOW ENGINE INNODB STATUS',
  'SHOW ENGINES',
  'SHOW ERRORS',
  'SHOW EVENTS',
  'SHOW EXPLAIN',
  'SHOW FUNCTION CODE',
  'SHOW FUNCTION STATUS',
  'SHOW GRANTS',
  'SHOW INDEX',
  'SHOW INDEXES',
  'SHOW INDEX_STATISTICS',
  'SHOW KEYS',
  'SHOW LOCALES',
  'SHOW MASTER LOGS',
  'SHOW MASTER STATUS',
  'SHOW OPEN TABLES',
  'SHOW PACKAGE BODY CODE',
  'SHOW PACKAGE BODY STATUS',
  'SHOW PACKAGE STATUS',
  'SHOW PLUGINS',
  'SHOW PLUGINS SONAME',
  'SHOW PRIVILEGES',
  'SHOW PROCEDURE CODE',
  'SHOW PROCEDURE STATUS',
  'SHOW PROCESSLIST',
  'SHOW PROFILE',
  'SHOW PROFILES',
  'SHOW QUERY_RESPONSE_TIME',
  'SHOW RELAYLOG EVENTS',
  'SHOW REPLICA',
  'SHOW REPLICA HOSTS',
  'SHOW REPLICA STATUS',
  'SHOW SCHEMAS',
  'SHOW SLAVE',
  'SHOW SLAVE HOSTS',
  'SHOW SLAVE STATUS',
  'SHOW STATUS',
  'SHOW STORAGE ENGINES',
  'SHOW TABLE STATUS',
  'SHOW TABLES',
  'SHOW TRIGGERS',
  'SHOW USER_STATISTICS',
  'SHOW VARIABLES',
  'SHOW WARNINGS',
  'SHOW WSREP_MEMBERSHIP',
  'SHOW WSREP_STATUS',
  'SHUTDOWN',
  'SIGNAL',
  'START ALL REPLICAS',
  'START ALL SLAVES',
  'START REPLICA',
  'START SLAVE',
  'START TRANSACTION',
  'STOP ALL REPLICAS',
  'STOP ALL SLAVES',
  'STOP REPLICA',
  'STOP SLAVE',
  'TRUNCATE',
  'TRUNCATE TABLE',
  'UNINSTALL PLUGIN',
  'UNINSTALL SONAME',
  'UNLOCK TABLE',
  'UPDATE',
  'USE',
  'WITH',
  'XA BEGIN',
  'XA COMMIT',
  'XA END',
  'XA PREPARE',
  'XA RECOVER',
  'XA ROLLBACK',
  'XA START',
  // other
  'ADD',
  'ALTER COLUMN',
  'FROM',
  'GROUP BY',
  'HAVING',
  'INSERT INTO',
  'INSERT',
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'SELECT',
  'VALUES',
  'WHERE',
];

/**
 * Priority 2
 * commands that operate on two tables or subqueries
 * two main categories: joins and boolean set operators
 */
const reservedBinaryCommands = [
  // set booleans
  'INTERSECT',
  'INTERSECT ALL',
  'INTERSECT DISTINCT',
  'UNION',
  'UNION ALL',
  'UNION DISTINCT',
  'EXCEPT',
  'EXCEPT ALL',
  'EXCEPT DISTINCT',
  'MINUS',
  'MINUS ALL',
  'MINUS DISTINCT',
  // joins
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'CROSS JOIN',
  'NATURAL JOIN',
  // non-standard joins
  'STRAIGHT_JOIN',
  'NATURAL LEFT JOIN',
  'NATURAL LEFT OUTER JOIN',
  'NATURAL RIGHT JOIN',
  'NATURAL RIGHT OUTER JOIN',
];

/**
 * Priority 3
 * keywords that follow a previous Statement, must be attached to subsequent data
 * can be fully inline or on newline with optional indent
 */
const reservedDependentClauses = ['WHEN', 'ELSE', 'ELSEIF', 'ELSIF'];

// For reference: https://mariadb.com/kb/en/sql-statements-structure/
export default class MariaDbFormatter extends Formatter {
  static operators = [':=', '<<', '>>', '<=>', '&&', '||'];

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedBinaryCommands,
      reservedDependentClauses,
      reservedLogicalOperators: ['AND', 'OR', 'XOR'],
      reservedKeywords: dedupe([...reservedKeywords, ...reservedFunctions]),
      stringTypes: ["''", '""', { prefix: 'X', quote: "''" }],
      identifierTypes: ['``'],
      positionalPlaceholders: true,
      lineCommentTypes: ['--', '#'],
      specialIdentChars: { prefix: '@' },
      operators: MariaDbFormatter.operators,
      preprocess,
    });
  }
}

function preprocess(tokens: Token[]) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.value === '(') {
      // This is SET datatype, not SET statement
      return { ...token, type: TokenType.RESERVED_KEYWORD };
    }
    return token;
  });
}
