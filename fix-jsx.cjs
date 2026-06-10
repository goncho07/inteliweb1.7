const fs = require('fs');

function fixJSX(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // We have:
    // {currentFolderContent.items.length > 0 ? (
    //                 (<div className="col-span-full order-1 mb-2"> ... currentFolderContent.items as ReportHistoryItem[]).map((report) => {

    content = content.replace(
        /\(\s*(<div className="col-span-full order-1 mb-2">[\s\S]*?)currentFolderContent/,
        `(\n                  <>\n                    $1\n                    {currentFolder`
    );

    // And close the <> right before the `) : (`
    // Wait, the map function goes all the way down.
    // It's followed by: `) : (` or `) : (`
    
    // Specifically:
    //                       return ( ... );
    //                     }
    //                   )
    //                 ) : (
    
    content = content.replace(
        /\s*\)\s*\)?\s*:\s*\(\s*<div className="flex flex-col/g,
        `\n                  )}\n                  </>\n                ) : (\n                  <div className="flex flex-col`
    );
    content = content.replace(
        /\s*\)\s*\)?\s*:\s*\(\s*<div className="text-center/g,
        `\n                  )}\n                  </>\n                ) : (\n                  <div className="text-center`
    );

    fs.writeFileSync(filePath, content);
}

fixJSX('modules/ClassroomsModule.tsx');
fixJSX('components/ReportShared.tsx');
