const fs = require('fs');

function restoreAndFix(filePath, isReportShared) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix the `{currentFolder.items ...` -> `{ (currentFolderContent.items ...` 
    // Wait, in `ClassroomsModule.tsx`, line 978 is `{currentFolder.items as ReportHistoryItem[]).map((report) => {`
    // In `ReportShared.tsx`, what is it?
    
    // Let's just fix it universally:
    if (content.includes('{currentFolder.items as ReportHistoryItem[]).map')) {
        content = content.replace(
            '{currentFolder.items as ReportHistoryItem[]).map',
            '{ (currentFolderContent.items as ReportHistoryItem[]).map'
        );
    }
    if (content.includes('{currentFolder.items as typeof MOCK_REPORTS_HISTORY).map')) {
        content = content.replace(
            '{currentFolder.items as typeof MOCK_REPORTS_HISTORY).map',
            '{ (currentFolderContent.items as typeof MOCK_REPORTS_HISTORY).map'
        );
    }
    
    // Let's fix the extra quotation marks
    content = content.replace(/opacity-70" order-2">/g, 'opacity-70 order-2">');
    content = content.replace(/opacity-70" order-4">/g, 'opacity-70 order-4">');

    fs.writeFileSync(filePath, content);
}

restoreAndFix('modules/ClassroomsModule.tsx', false);
restoreAndFix('components/ReportShared.tsx', true);
