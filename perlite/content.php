<?php

/*!
 * Perlite v1.6 (https://github.com/secure-77/Perlite)
 * Author: sec77 (https://secure77.de)
 * Licensed under MIT (https://github.com/secure-77/Perlite/blob/main/LICENSE)
 */

use Perlite\PerliteParsedown;

require_once __DIR__ . '/vendor/autoload.php';
require_once 'helper.php';

// check get params
if (isset($_GET['mdfile'])) {
	$requestFile = $_GET['mdfile'];

	if (is_string($requestFile)) {
		if (!empty($requestFile)) {
			parseContent($requestFile);
		}
	}
}

// parse content for about modal
if (isset($_GET['about'])) {

	if (is_string($_GET['about'])) {
		parseContent('/' . $about);
	}
}

// search request
if (isset($_GET['search'])) {

	$searchString = $_GET['search'];
	if (is_string($searchString)) {
		if (!empty($searchString)) {
			echo doSearch($rootDir, $searchString);
		}
	}
}


// parse content for home site
if (isset($_GET['home'])) {

	if (is_string($_GET['home'])) {
		parseContent('/' . $index);
	}
}


// parse the md to html
function parseContent($requestFile)
{

	global $path;
	global $uriPath;
	global $cleanFile;
	global $rootDir;
	global $startDir;
	global $lineBreaks;
	global $allowedFileLinkTypes;
	global $htmlSafeMode;
	global $relPathes;


	if(str_contains($requestFile, "Excalidraw")){
		$Parsedown = new PerliteParsedown(1);
	} else {
		$Parsedown = new PerliteParsedown(0);
	}
	
	$Parsedown->setSafeMode($htmlSafeMode);
	$Parsedown->setBreaksEnabled($lineBreaks);
	$cleanFile = '';

	// call menu again to refresh the array
	menu('perlite/'.$rootDir);
	$path = '';


	// get and parse the content, return if no content is there
	if(str_contains($requestFile, "base")){
		$content = getContent($requestFile, 1);
		echo $content;
		return;
	} else {
		$content = getContent($requestFile);
	}
	if ($content === '') {
		return;
	}

	$wordCount = str_word_count($content);
	$charCount = strlen($content);
	$content = $Parsedown->text($content);


	// Relative or absolute pathes
	if ($relPathes) {
		$path = $startDir;
		$mdpath = '';
	} else {
		$mdpath = $path;
		$path = $startDir . $path;
	}

	// fix links (not used)
	// $oldPath = $startDir . $path;

	// // fix relativ links in parent folders
	// $pattern = array('/(\[\[)(\.\.\/.*)(\]\])/');
	// $content = fixLinks($pattern, $content, $oldPath, false);

	// // // fix relativ links in same folders
	//  $pattern = array('/(\[\[)+([^\/]+?)(\]\])/');
	//  $content = fixLinks($pattern, $content, $path, true);

	// // fix relativ links in subfolder and same folders
	// $pattern = array('/(\[\[)(?!Demo Documents\/)(.+)(\]\])/');
	// $content = fixLinks($pattern, $content, $path, true);


	$linkFileTypes = implode('|', $allowedFileLinkTypes);

	$allowedImageTypes = '(\.png|\.jpg|\.jpeg|\.svg|\.gif|\.bmp|\.tif|\.tiff|\.webp)';

	$src_path = $uriPath . $path;

	// embedded pdf links
	$replaces = '<embed src="' . $src_path . '/\\2" type="application/pdf" style="min-height:100vh;width:100%">';
	$pattern = array('/(\!\[\[)(.*?.(?:pdf))(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// embedded mp4 links
	$replaces = '
	<video controls src="' . $src_path . '/\\2" type="video/mp4">
		<a class="internal-link" target="_blank" rel="noopener noreferrer" href="' . $src_path . '/' . '\\2">Your browser does not support the video tag: Download \\2</a>
  	</video>';
	$pattern = array('/(\!\[\[)(.*?.(?:mp4))(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);


	// embedded m4a links
	$replaces = '
	 <video controls src="' . $src_path . '/\\2" type="audio/x-m4a">
			 <a class="internal-link" target="_blank" rel="noopener noreferrer" href="' . $src_path . '/' . '\\2">Your browser does not support the audio tag: Download \\2</a>
	 </video>';
	$pattern = array('/(\!\[\[)(.*?.(?:m4a))(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);


	// links to other files with Alias
	$replaces = '<a class="internal-link" target="_blank" rel="noopener noreferrer" href="' . $src_path . '/' . '\\2">\\3</a>';
	$pattern = array('/(\[\[)(.*?.(?:' . $linkFileTypes . '))\|(.*)(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// links to other files without Alias
	$replaces = '<a class="internal-link" target="_blank" rel="noopener noreferrer" href="' . $src_path . '/' . '\\2">\\2</a>';
	$pattern = array('/(\[\[)(.*?.(?:' . $linkFileTypes . '))(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// img links with external target link
	$replaces = 'noreferrer"><img class="images" width="\\4" height="\\5" alt="image not found" src="' . $src_path . '/\\2\\3' . '"/>';
	$pattern = array('/noreferrer">(\!?\[\[)(.*?)' . $allowedImageTypes . '\|?(\d*)x?(\d*)(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// img links with size
	$replaces = '<p><a href="#" class="pop"><img class="images" width="\\4" height="\\5" alt="image not found" src="' . $src_path . '/\\2\\3' . '"/></a></p>';
	$pattern = array('/(\!?\[\[)(.*?)' . $allowedImageTypes . '\|?(\d*)x?(\d*)(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// centerise or right align images with "center"/"right" directive
	$pattern = '/(\!?\[\[)(.*?)' . $allowedImageTypes . '\|?(center|right)\|?(\d*)x?(\d*)(\]\])/';
	$replaces = function ($matches) use ($src_path) {
		$class = "images";  // Default class for all images
		if (strpos($matches[4], 'center') !== false) {
			$class .= " center";  // Add 'center' class
		} elseif (strpos($matches[4], 'right') !== false) {
			$class .= " right";  // Add 'right' class
		}
		$width = $matches[5] ?? 'auto';
		$height = $matches[6] ?? 'auto';
		return '<p><a href="#" class="pop"><img class="' . $class . '" src="' . $src_path . '/' . $matches[2] . $matches[3] . '" width="' . $width . '" height="' . $height . '"/></a></p>';
	};
	$content = preg_replace_callback($pattern, $replaces, $content);

	// img links with captions and size
	$replaces = '<p><a href="#" class="pop"><img class="images" width="\\5" height="\\6" alt="\\4" src="' . $src_path . '/\\2\\3' . '"/></a></p>';
	$pattern = array('/(\!?\[\[)(.*?)' . $allowedImageTypes . '\|?(.+\|)\|?(\d*)x?(\d*)(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);

	// img links with captions
	$replaces = '<p><a href="#" class="pop"><img class="images" alt="\\4" src="' . $src_path . '/\\2\\3' . '"/></a></p>';
	$pattern = array('/(\!?\[\[)(.*?)' . $allowedImageTypes . '\|?(.+|)(\]\])/');
	$content = preg_replace($pattern, $replaces, $content);


	// handle internal site links
	// search for links outside of the current folder
	$pattern = array('/(\[\[)(?:\.\.\/)+(.*?)(\]\])/');
	$content = translateLink($pattern, $content, $path, false);

	// search for links in the same folder
	$pattern = array('/(\[\[)(.*?)(\]\])/');
	$content = translateLink($pattern, $content, $mdpath, true);


	// add some meta data
	$content = '
	<div style="display: none">
		<div class="mdTitleHide">' . $cleanFile . '</div>
		<div class="wordCount">' . $wordCount . '</div>
		<div class="charCount">' . $charCount . '</div>
	</div>' . $content;

	echo $content;
	return;

}


// translate relativ links (not used)
// function fixLinks($pattern, $content, $path, $sameFolder) {

// 	return preg_replace_callback($pattern, 
// 	function($matches) use ($path, $sameFolder) {

// 		$newAbPath = $path;
// 		echo "path: " . $path;
// 		echo "<br>";
// 		$pathSplit = explode("/",$path);
// 		$linkFilePart = $matches[2];
// 		$esapeSequence = "#regex_run#";
// 		echo '$matches[1]: ' . $matches[1];
// 		echo '<br>';
// 		echo '$matches[2]: ' . $linkFilePart;
// 		echo '<br>';

// 		$linkDesc = "";

// 		# handle custom link comments and sizes
// 		$splitLink = explode("|", $matches[2]);
// 		if (count($splitLink) > 1) {
// 			$linkFilePart = $splitLink[0];
// 			array_shift($splitLink);
// 			$linkDesc = '|' .implode("|", $splitLink);
// 		}


// 		// do extra stuff to get the absolute path
// 		if ($sameFolder == false) {
// 			$countDirs = count(explode("../",$linkFilePart));
// 			$countDirs = $countDirs -1;
// 			$newPath = array_splice($pathSplit, 1, -$countDirs);			
// 			$newAbPath = implode('/', $newPath);
// 			echo "new file path: " . $newAbPath;
// 			echo "<br>";
// 			echo "old file path: " . $linkFilePart;
// 			echo "<br>";
// 		}

// 		if (substr($newAbPath,0,1) == '/') {
// 			$newAbPath = substr($newAbPath,1);
// 		}


// 		$origPath = explode('/', $linkFilePart);
// 		array_pop($origPath);
// 		$origPath = implode('/', $origPath);
// 		//check if its already an absolut path
// 		echo "new file path: " . $newAbPath;
// 		echo "<br>";
// 		echo "old file path: " . $origPath;
// 		echo "<br>";


// 		if (count_chars($origPath) >= count_chars($newAbPath)) {

// 			$urlPath = $linkFilePart;

// 		} else {

// 			$linkFile = str_replace("../","",$linkFilePart);
// 			$urlPath = $newAbPath. '/'. $linkFile;
// 		}


// 		return '[['.$urlPath.$linkDesc.']]';
// 	}
// ,$content);
// }



//internal links
// can be simplified (no need of path translation)
function translateLink($pattern, $content, $path, $sameFolder)
{

	return preg_replace_callback(
		$pattern,
		function ($matches) use ($path, $sameFolder) {


			global $uriPath;
			$newAbPath = $path;
			$pathSplit = explode("/", $path);
			$linkName_full = $matches[2];
			$linkName = $linkName_full;
			$linkFile = $matches[2];

			# handle custom internal obsidian links
			$splitLink = explode("|", $matches[2]);
			if (count($splitLink) > 1) {

				$linkFile = $splitLink[0];
				$linkName = $splitLink[1];
			}

			# handle internal popups
			$popupClass = '';
			$popUpIcon = '';

			if (count($splitLink) > 2) {

				$popupClass = ' internal-popup';
				$popUpIcon = '<svg class="popup-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>';
			}


			// do extra stuff to get the absolute path
			if ($sameFolder == false) {
				$countDirs = count(explode("../", $matches[0]));
				$countDirs = $countDirs - 1;
				$newPath = array_splice($pathSplit, 1, -$countDirs);
				$newAbPath = implode('/', $newPath);
			}


			$urlPath = $newAbPath . '/' . $linkFile;
			if (substr($urlPath, 0, 1) == '/') {
				#$urlPath = '/' . $urlPath;
				$urlPath = substr($urlPath, 1);
			}

			$refName = '';

			# if same document heading reference
			if (substr($linkName_full, 0, 1) == '#') {

				$splitLink = explode("#", $urlPath);
				$urlPath = '';
				$refName = $splitLink[1];
				$refName = '#' . $refName;
				$href = 'href="';
			} else {
				#$href = 'href="?link=';
				$href = 'href="' . $uriPath;
			}

			$urlPath = str_replace('&amp;', '&', $urlPath);

			#$urlPath = rawurlencode($urlPath);
			$urlPath = str_replace('%23', '#', $urlPath);

			$urlPath = str_replace('~', '%80', $urlPath);
			$urlPath = str_replace('-', '~', $urlPath);
			$urlPath = str_replace(' ', '-', $urlPath);


			return '<a class="internal-link' . $popupClass . '"' . $href . $urlPath . $refName . '">' . $linkName . '</a>' . $popUpIcon;
		}
		,
		$content
	);
}


// read content from file
function getContent($requestFile, $isBase =-1)
{
	global $avFiles;
	global $path;
	global $cleanFile;
	global $rootDir;
	$content = '';
	
	// check if file is in array
	if (in_array($requestFile, $avFiles, true)) {
		$cleanFile = $requestFile;
		$n = strrpos($requestFile, "/");
		$path = substr($requestFile, 0, $n);
		if($isBase == -1){
			$content .= file_get_contents($rootDir . $requestFile . '.md', true);
		} else {
			// $content .= file_get_contents($rootDir . $requestFile , true);
			$content .= getBases($rootDir . $requestFile);
		}
	
	}

	return $content;
}

function getBases($baseFile){
	global $notesPath;
	global $rootDir;
	global $cleanFile;
	$contents = file_get_contents($baseFile, true);
	$tempPath = __DIR__ . "/" . $rootDir . "/" . $notesPath;
	$db = new SQLite3($tempPath);
	$t = $db->query("SELECT * FROM notes");
	// while($row = $t->fetchArray()){
	// 	var_dump($row);
	// }
	$baseProperties = yaml_parse($contents);
	$result = handleYamlViews($baseProperties, $db);
	// foreach($baseProperties as $key => $value){
	// 	// process each key-value pair as needed

	// }
	// $cleanFile =
	$wordCount = str_word_count($contents);
	$charCount = strlen($contents);
	$html = '<div class="bases-view">
		    	<div class="bases-header">	
					<div class="bases-toolbar">
						<div class="bases-toolbar-item bases-toolbar-views">
							<span class="text-button-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-table"><path d="M12 3v18"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path></svg></span>
							<span class="text-button-label">View 2</span>
							<span class="text-button-icon mod-aux"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevrons-up-down"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg></span>
						</div>
						<div class="bases-toolbar-item bases-toolbar-res">Results: '. $result['count'] .'</div>
						<div class="bases-toolbar-item">Sort</div>
						<div class="bases-toolbar-item">Filter</div>
					</div>
					
				</div>
				<div class="bases-result-container">' . $result["html"] .
			'</div></div>';
	$content = '
	<div style="display: none">
		<div class="mdTitleHide">' . substr($cleanFile, 0, -5) . '</div>
		<div class="wordCount">' . $wordCount . '</div>
		<div class="charCount">' . $charCount . '</div>
	</div>' . $html;
	return $content;
}

function handleYamlViews($yamlObject, $db){
	global $uriPath;
	global $rootDir;
	$and = [];
	$html = "";
	$views = $yamlObject['views'][0];
	$count = 0;
	// Check if there is a global filter
	if(array_key_exists('filters', $yamlObject)){
		// Check the array 
		if(array_key_exists('and', $yamlObject['filters'])){
			// process each filter
			foreach($yamlObject['filters']['and'] as $filter){
				$matches = [];
				switch($filter){
					case (preg_match("/file.hasProperty\(\"([\w]+)\"\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
					break;
					case (preg_match("/(\w+) == \"(\w+)\"/", $filter, $matches)? true: false):
						array_push($and, $matches[1] . " = '" . $matches[2] . "'");
					break;
					case (preg_match("/!(\w+)\.isEmpty\(\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
					break;
				}
			}
		}
		$columns = [];
		$sort = "";
		if(array_key_exists('sort', $views)){
			$sort .= 'ORDER BY ' . $views['sort'][0]['property'] .  " " . $views['sort'][0]['direction'];
		}
		if(array_key_exists('order', $views)){
			
			foreach($views['order'] as $column){
				if ($column == "file.name"){
					continue;
				} else if ($column == "cover"){
					continue;
				} else {
					array_push($columns, $column);
				}
				
			}
		}
		$andStatment = implode(" AND ", $and);
		$query ="SELECT * FROM notes WHERE " . $andStatment . " " .$sort;
		$res = $db->query($query);
		while ($row = $res->fetchArray()) {
			$count += 1; 
			$matches = [];
			$filePath = $uriPath . $rootDir . "/" . explode('/',$row['title'])[1];
			$urlEncoded = urlencode(substr($row['title'], 1, -3));
			if ($row['image'] != null ){
				$tmp = preg_match("/\[\[\.?\.?(\/?(.*))\]\]/", $row['image'], $matches);
				$img = $filePath . $matches[1];
				$html .= '<div class="bases-item" onClick="getContent(\'' . $urlEncoded . '\')">
					<img class="bases-img" src="' . $img . '">
					<div class="bases-properties">';
			} else {
				$html .= '<div class="bases-item" onClick="getContent(\'' . $urlEncoded . '\')">
					<div class="bases-cover"></div>
					<div class="bases-properties">';
			}
			$title = end(explode('/',$row['title']));
			$html .= '<div class="bases-title">' . substr($title,0, -3) .'</div>';

    		foreach($columns as $col){
				if ($col == "image"){
					continue;
				}
				$html .= '
				<div class="bases-prop-header">' . $col .'</div>
				<div class="bases-prop-value">' . $row[$col] .'</div>
				';
			}
			$html .= "</div></div>";
    		
		}
	}
	
	
	
	if(array_key_exists('filters', $views)){
		if(array_key_exists('and', $views['filters'])){
			// process each filter
			foreach($views['filters']['and'] as $filter){
				$matches = [];
				switch($filter){
					case (preg_match("/file.hasProperty\(\"([\w]+)\"\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
					break;
					case (preg_match("/(\w+) == \"([\w ]+)\"/", $filter, $matches)? true: false):
						array_push($and, $matches[1] . " = '" . $matches[2] . "'");
					break;
					case (preg_match("/!(\w+)\.isEmpty\(\)/", $filter, $matches) ? true: false):
						array_push($and, $matches[1] ." IS NOT NULL");
					break;
				}
			}
		}
		$columns = [];
		if(array_key_exists('order', $views)){
			
			foreach($views['order'] as $column){
				if ($column == "file.name"){
					continue;
				} else if ($column == "cover"){
					continue;
				} else {
					array_push($columns, $column);
				}
				
			}
		}
		$andStatment = implode(" AND ", $and);
		$res = $db->query("SELECT * FROM notes WHERE " . $andStatment);

		while ($row = $res->fetchArray()) {
			$count +=1;
			$matches = [];
			$filePath = $uriPath . $rootDir . "/" . explode('/',$row['title'])[1];
			$urlEncoded = urlencode(substr($row['title'], 1, -3));
			if ($row['image'] != null ){
				$tmp = preg_match("/\[\[\.?\.?(\/?(.*))\]\]/", $row['image'], $matches);
				$img = $filePath . $matches[1];
				$html .= '<div class="bases-item" onClick="getContent(\'' . $urlEncoded . '\')">
					<img class="bases-img" src="' . $img . '">
					<div class="bases-properties">';
			} else {
				$html .= '<div class="bases-item" onClick="getContent(\'' . $urlEncoded . '\')">
					<div class="bases-cover"></div>
					<div class="bases-properties">';
			}
			$title = end(explode('/',$row['title']));
			$html .= '<div class="bases-title">' . substr($title,0, -3) .'</div>';

    		foreach($columns as $col){
				if ($col == "image"){
					continue;
				}
				$html .= '
				<div class="bases-prop-header">' . $col .'</div>';
				if ($row[$col] == null || $row[$col] == ''){
					$html .= '<div class="bases-prop-value">&nbsp;</div>';
				} else {
					$html .= '<div class="bases-prop-value">' . $row[$col] .'</div>';
				}
				
			}
			$html .= "</div></div>";
		}
	}
	return array(
		"html" => $html,
		"count" => $count,
	);
}
?>