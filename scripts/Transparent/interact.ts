import {ethers} from "hardhat";

async function main() {
    const proxyAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"; // Địa chỉ proxy đã triển khai trước đó

    const LogicContract = await ethers.getContractAt("LogicContract", proxyAddress);
    // Gọi hàm setValue thông qua proxy
    await LogicContract.setValue(42);
    console.log("Value set to 42");
    // // Kiểm tra giá trị
    const value = await LogicContract.value();
    console.log("Value is:", value.toString());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
