<?php
$content = file_get_contents('jen.sql');
echo "Searching for voucher, imprest, invoice...\n";
if (preg_match_all('/CREATE TABLE `?([a-zA-Z0-9_]*?(voucher|imprest|invoice|receipt)[a-zA-Z0-9_]*?)`?\s*\((.*?)\)\s*ENGINE/si', $content, $matches)) {
    foreach($matches[1] as $idx => $tableName) {
        echo "Table: $tableName\n";
        echo $matches[3][$idx] . "\n\n";
    }
} else {
    echo "No matching tables found.\n";
}
