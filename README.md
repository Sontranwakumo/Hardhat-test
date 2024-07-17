- Bài 2: Viết contract mua NFT
  - Contract NFT 721
  `Is nft721`
  - Trong vòng 10 block, người dùng có quyền đấu giá mua NFT

  - Người dùng đấu giá bằng ETH
  - Ở block thứ 10, người dùng có giá trị đấu giá cao nhất sẽ được quyền claim NFT về ví mình
  `Cứ 10 người `
  - Nếu không có người dùng nào đấu giá, NFT sẽ được trả về cho owner.
  `nghĩa là trong 10 block được thực hiện đó, không có ai đấu giá cả.`
  - Vòng tiếp theo sẽ được bắt đầu sau khi người trước claim NFT hoặc NFT được trả về cho owner.
  - Thời hạn bắt đầu tính từ block thứ 0 cho đấu giá là lúc contract được deploy.

  Hành động bid.
  Bid sẽ bị cấm nếu round đó đã kết thúc.
  Round mới chỉ được tiếp theo sau khi người thắng claim NFT hoặc NFT trả về. Có nghĩa là hàm claim phải được gọi bởi người chủ sở hữu thì round tiếp theo mới bắt đầu được.

  Trong logic, khi round bắt đầu, người sau phải trả giá cao hơn người trước.

  Kiểm tra round kết thúc bằng những hàm hành động bên trong contract liên quan tới đặt cược. Vậy chỉ đơn giản kiểm tra nếu số block vượt quá end block là được.