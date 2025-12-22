<?php

    include "settings.php";
    class FileInfo{
        public $fileId;
        public $filePath;
        public $extension; 

        public function __construct($fileId, $filePath, $extension)
        {
            $this->fileId = $fileId;
            $this ->filePath = $filePath;
            $this ->extension = $extension;
        }
    }

    
    $fileBase = __DIR__ . "/" . $rootDir;
    if(isset($_GET['mdfile'])){

        $cont = file_get_contents($fileBase .  $_GET['mdfile'] . ".md");
        $path = implode("/",explode("/", $_GET['mdfile'], -1));
        $test = explode("```", $cont);
        $fileMatches = [];
        $files = [];
        $filePattern = "/(\w+): \[\[\.?\.?(.+)\.(png|jpg|svg)\]\]/";
        $results = preg_match_all($filePattern, $cont, $fileMatches);
        $excalData= substr($test[1], 4);
        for ($i = 0; $i < count($fileMatches[1]); $i++) {
            $end = '';
            if($fileMatches[3][$i] == 'svg'){
                $end = '+xml';
            }
            if (str_starts_with($fileMatches[2][$i], "../")){
                $files[] = new FileInfo($fileMatches[1][$i],$uriPath . $rootDir . $fileMatches[2][$i] . ".". $fileMatches[3][$i], 'image/' .$fileMatches[3][$i] . $end);
            } else {
                
                $files[] = new FileInfo($fileMatches[1][$i],$uriPath . $rootDir . $path . "/" . $fileMatches[2][$i] . ".". $fileMatches[3][$i], 'image/' .$fileMatches[3][$i] . $end);
            }
            
        }
        $jason = array(
            "jsonOutput" => $excalData,
            "files" => $files
        );
    } else {
        $jason = "";
    }
    
    echo (json_encode($jason));
?>