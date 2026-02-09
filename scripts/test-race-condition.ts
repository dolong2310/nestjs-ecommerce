const API_URL = 'http://localhost:8080/orders';

const accessToken1 = '';
const accessToken2 = '';

const headers1 = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken1}`,
};

const headers2 = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken2}`,
};

const body1 = [
  {
    shopId: 1,
    receiver: {
      name: 'Unknown User',
      phoneNumber: '0908123123',
      address: '1 Sài Gòn, Quận 1, TP.HCM',
    },
    cartItemIds: [41],
  },
];

const body2 = [
  {
    shopId: 1,
    receiver: {
      name: 'Unknown User',
      phoneNumber: '0908123123',
      address: '1 Sài Gòn, Quận 1, TP.HCM',
    },
    cartItemIds: [43],
  },
];

const fetch1 = fetch(API_URL, {
  method: 'POST',
  headers: headers1,
  body: JSON.stringify(body1),
}).catch((error) => {
  console.log('error 1: ', error);
  throw error;
});

const fetch2 = fetch(API_URL, {
  method: 'POST',
  headers: headers2,
  body: JSON.stringify(body2),
}).catch((error) => {
  console.log('error 2: ', error);
  throw error;
});

Promise.all([fetch1, fetch2])
  .then(([response1, response2]) => {
    console.log('response1: ', response1);
    console.log('response2: ', response2);
  })
  .catch((error) => {
    console.log('error: ', error);
  });

// Giải pháp: sử dụng pessimistic lock
// Tạo 1 transaction để lock 1 record: BEGIN;
// Câu lệnh sql để lock 1 record là: SELECT * FROM "SKU" WHERE id = ? FOR UPDATE;
// Thoát khỏi transaction pessimistic lock, sử dụng câu lệnh sql: COMMIT; hoặc ROLLBACK;
// 1 khi đã lock thì các câu lệnh update sau khi lock sẽ pending, chờ commit hoặc rollback để thực hiện
// nếu lock trong 1 transaction thì thì các lệnh sau khi lock phải chờ tới khi transaction chạy xong
