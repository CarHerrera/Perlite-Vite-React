#!/bin/bash

#Default Settings File
FILE="./perlite/settings.php"

# We escape the $ and wrap the part we want to extract in ( )
# This regex looks for: $rootDir = 'someValue';
rootRegex="rootDir = \"([A-Za-z]+)\""
# This regex is meant to capture the folders to avoid
hiddenRegex="ignoreFiles = \"(.+)\""
hiddenFolders=""
vault=""
if [[ -f "$FILE" ]]; then
    echo "Reading lines from $FILE..."
    
    while IFS= read -r line; do
        if [[ "$line" =~ $rootRegex ]]; then
            # BASH_REMATCH[1] now contains what was inside the parentheses
            echo "Found value: ${BASH_REMATCH[1]}"
            vault=${BASH_REMATCH[1]}
        elif [[ "$line" =~ $hiddenRegex ]]; then
            # for i in "${!BASH_REMATCH[@]}"; do
            #     echo "$i: ${BASH_REMATCH[$i]}"
            # done
            hiddenFolders=${BASH_REMATCH[1]}
        fi
    done < "$FILE"
else
    echo "Error: File '$FILE' not found."
fi
echo $hiddenFolders
if [[ -d './public/'$vault ]]; then 
    echo "EXists"
    rm -rf './public/'$vault
    echo "Gone"
else 
    echo "Doesnt"
fi 


# Splits the hidden folders by , and then stores them in folder
IFS=',' read -ra hiddenFiles <<< "$hiddenFolders"
# for i in "${hiddenFiles[@]}"; do
#   # process "$i"
#   echo $i
# done
check_folders(){
    local folder=$1
    echo $folder
    for file in $folder/*; do
    # If Folder
        if [[ -d $file ]]; then
            ignore=0
            for i in "${hiddenFiles[@]}"; do
            # If the folder we are looking at is one of the hidden ones, we ignore
                if [[ $file =~ $i ]]; then
                #     echo $folder
                    # echo "Should not be here " $file
                    ignore=1
                    break
                fi
            done
            if [[ ignore -eq 0 ]]; then
              echo $(check_folders $file)
            else 
                return
            fi
        else 
            extension="${file##*.}"
            if [[ "$extension" == "$file" ]]; then
                continue
            else
                
                # We are ignoring typical files likes md and bases
                if [[ "$extension" == "md"  || $extension == "base" ]]; then
                        continue
                else 
                    ignore=0
                    for i in "${hiddenFiles[@]}"; do
                    # If the folder we are looking at is one of the hidden ones, we ignore
                        if [[ $file =~ $i ]]; then
                        #     echo $folder
                            # echo "Should not be here " $file
                            ignore=1
                            break
                        fi
                    done
                    if [[ ignore -eq 0 ]]; then
                    # Extra file check for the hanging strings
                        if [[ -f "$file" ]]; then 

                            newPath="${file/perlite/"public"}"
                            targetDir=$(dirname "$newPath")
                            mkdir -p $targetDir
                            tmp="./"$file
                            tmp1="./"$newPath
                            printf "$tmp\n"
                            printf "$tmp1\n"
                            cp "$file" "$newPath"
                        fi
                    else 
                        return
                    fi
                fi
            fi
        fi 
        
    done
}

for folders in perlite/$vault/*; do
# This will print each folder and file
    echo $(check_folders $folders)
done
# Copy Styles
cp -r perlite/$vault/.obsidian public/$vault/
