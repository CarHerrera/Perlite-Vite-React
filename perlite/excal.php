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

    
    $fileBase = __DIR__ . "/" . $vaultName;
    if(isset($_GET['mdfile'])){

        $cont = file_get_contents($fileBase .  $_GET['mdfile'] . ".md");
        $test = explode("```", $cont);
        $fileMatches = [];
        $files = [];
        $filePattern = "/(\w+): \[\[\.\.(\/Maps\/.*\.(png|jpg))\]\]/";
        $results = preg_match_all($filePattern, $cont, $fileMatches);
        $excalData= substr($test[1], 4);
        for ($i = 0; $i < count($fileMatches[1]); $i++) {
            $files[] = new FileInfo($fileMatches[1][$i],"/Whendeez" . $fileMatches[2][$i], 'image/' .$fileMatches[3][$i]);
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