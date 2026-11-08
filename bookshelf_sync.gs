// 드라이브의 '부모님' 폴더 → 하위 폴더(책) → 사진/영상 목록을 JSON으로 돌려주는 웹앱
const ROOT_FOLDER_NAME = '부모님'; // 최상위 폴더 이름
const ROOT_FOLDER_ID = '';        // 같은 이름 폴더가 여러 개면 폴더 ID를 넣으세요 (비우면 이름으로 찾음)

function doGet() {
  let root;
  if (ROOT_FOLDER_ID) {
    root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  } else {
    const found = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    if (!found.hasNext()) return out({ books: [], error: 'folder not found' });
    root = found.next();
  }

  const books = [];
  const subs = root.getFolders();
  while (subs.hasNext()) {
    const folder = subs.next();
    const items = [];
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const mime = file.getMimeType();
      const isVideo = mime.indexOf('video/') === 0;
      if (isVideo || mime.indexOf('image/') === 0) {
        items.push({ id: file.getId(), name: file.getName(), type: isVideo ? 'video' : 'image' });
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    books.push({
      id: folder.getId(),
      title: folder.getName(),
      date: Utilities.formatDate(folder.getDateCreated(), 'Asia/Seoul', 'yyyy년 M월'),
      items: items
    });
  }
  books.sort((a, b) => a.title.localeCompare(b.title));
  return out({ books: books });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
