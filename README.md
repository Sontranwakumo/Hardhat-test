- Bài 3:
  - Viết contract bán NFT theo giá bid:
    + NFT Có thể là 1155 hoặc 721 
     `Đầu tiên sẽ mint cho cả user1 và user2 một số`
    + Sẽ có nhiều người được bán cùng lúc
    + userA có NFT, muốn bán NFT theo cách đấu giá 
    + userA nạp NFT vào sàn đấu giá, với giá min
    + Có thời gian bắt đầu, kết thúc 
    + Sau thời gian kết thúc:
        - Nếu có người đấu giá, người đấu giá cao nhất có thể claim NFT
        - Người bán NFT có thể claim tiền đã bán NFT
        - Nếu không có người đấu giá, NFT sẽ được trả về cho người bán
    + Người bán có thể hủy đấu giá trước thời gian kết thúc nếu không có người đấu giá, NFT sẽ đc trả về người bán 
    + Admin có quyền hủy đấu giá bất kì lúc nào, NFT sẽ đc trả về người bán, người đã đấu giá sẽ được nhận lại tiền
  - Vẽ diagram cho flow của contract
  - Viết contract theo logic được vẽ từ diagram + unit test