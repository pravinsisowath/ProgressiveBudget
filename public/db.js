let db
const request = indexedDB.open('list', 1)

request.onupgradeneeded = function (event) {
  db = event.target.result

  db.createObjectStore('pending', {
    autoIncrement: true
  })
}

request.onsuccess = function (event) {
  db = event.target.result

  if (navigator.onLine) {
    checkDatabase()
  }
}

request.onerror = function (event) {
  console.log(event.target.errorCode)
}

const saveRecord = item => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  store.add(item)
}

const checkDatabase = function() {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  const getAll = store.getAll()

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      axios.post('/api/transaction/bulk', getAll.result)
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore('pending')
          store.clear()
        })
    }
  }
}

window.addEventListener('online', checkDatabase)