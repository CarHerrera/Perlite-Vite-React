<?php
include "settings.php";
require_once __DIR__ . '/vendor/autoload.php';
require_once 'helper.php';




$out = [];
if(isset($_GET['base'])){
	$filePath = __DIR__ . '/' . $rootDir . $_GET['base'];
	$tempPath = __DIR__ . "/" . $rootDir . "/" . $notesPath;
	$db = new SQLite3($tempPath);
	$file = file_get_contents($filePath, true);
	$yamlObject = yaml_parse($file);
	$globalFilter = "";
	$globalFilterCheck = [];
	if(array_key_exists('filters', $yamlObject) && $yamlObject != null){
    // Check the array 
		$and = [];
		if(array_key_exists('and', $yamlObject['filters'])){
			// process each filter
			foreach($yamlObject['filters']['and'] as $filter){
				$matches = [];
				switch($filter){
					case (preg_match("/file.hasProperty\(\"([\w]+)\"\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
						array_push($globalFilterCheck, $matches[1] ." IS NOT NULL");
					break;
					case (preg_match("/(\w+) == \"(\w+)\"/", $filter, $matches)? true: false):
						array_push($and, $matches[1] . " = '" . $matches[2] . "'");
						array_push($globalFilterCheck, $matches[1] ." IS NOT NULL");
					break;
					case (preg_match("/!(\w+)\.isEmpty\(\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
						array_push($globalFilterCheck, $matches[1] ." IS NOT NULL");
					break;
				}
			}
		}
		$columns = [];
		$andStatment = implode(" AND ", $and);
		$globalFilter ="SELECT * FROM notes WHERE " . $andStatment;
    // $res = $db->query($query);
    
	}
	foreach($yamlObject['views'] as $view){
		// View has some custom filters
		$localFilter = [];
		$out[$view['name']] = array();
		$and = [];
		if(array_key_exists('filters', $view)){
			if(array_key_exists('and', $view['filters'])){
				// process each filter
				foreach($view['filters']['and'] as $filter){
					$matches = [];
					switch($filter){
						case (preg_match("/file.hasProperty\(\"([\w]+)\"\)/", $filter, $matches) ? true: false):
							array_push($and, $matches[1] ." IS NOT NULL");
							array_push($localFilter, $matches[1]." IS NOT NULL");
						break;
						case (preg_match("/(\w+) == \"([\w ]+)\"/", $filter, $matches)? true: false):
							array_push($and, $matches[1] . " = '" . $matches[2] . "'");
							array_push($localFilter, $matches[1]. " = '" . $matches[2] . "'");
						break;
						case (preg_match("/!(\w+)\.isEmpty\(\)/", $filter, $matches) ? true: false):
							array_push($and, $matches[1] ." IS NOT NULL");
							array_push($localFilter, $matches[1] ." IS NOT NULL");
						break;
					}
				}
			}
		}

		$columns = [];
		if(array_key_exists('order', $view)){
			foreach($view['order'] as $column){
				if ($column == "file.name"){
					array_push($columns, "title");
				} else {
					array_push($columns, $column);
				}
				
			}
		}
		
		$andStatment = implode(" AND ", $and);
		$out[$view['name']]['order'] = $columns;
		// $orderStatement = implode(" ,", $columns);
		// No global filter was set in the view, so there must be some other filter or default showing
		$res;
		if($globalFilter === ""){
			if ($and !== []) {
					$res = $db->query("SELECT * FROM notes WHERE " . $andStatment);
			} else {
				$res = $db->query("SELECT * FROM notes");
			}
			
		} else{
			if(count($and) == 0) {
				$res = $db->query("SELECT * FROM (" . $globalFilter . ")");
			} else {
				$res = $db->query("SELECT * FROM (" . $globalFilter . ") WHERE" . $andStatment);
			}
			
		}
		$count = 0;
		while($row = $res->fetchArray($mode = SQLITE3_ASSOC)){ 
			$tempRow = [];
			foreach($row as $key => $val){
				if($val == null){
					continue;
				}
				$tempRow[$key] = $val;
			}
			array_push($out[$view['name']], $tempRow);
			$count += 1;
		}
		$out[$view['name']]['count'] = $count;
		$out[$view['name']]['type'] = $view['type'];
		$out[$view['name']]['localFilter'] = $localFilter;
        if(array_key_exists('sort', $view)){
            $out[$view['name']]['sort'] = $view['sort'];
        } else {
            $out[$view['name']]['sort'] = [];
        }
	}
	if($globalFilter === ""){
		$globalFilterCheck = [];
	} 
	$resp = array(
		"status" => "success",
		"notes" => $out,
		"global_filter" => $globalFilterCheck
	);
	echo (json_encode($resp));
} else {
	$tesp = array(
		"status" => "fail",
		"notes" => array()
	);
	echo (json_encode($tesp));
}
// There exists a filter that applies to each view

?>