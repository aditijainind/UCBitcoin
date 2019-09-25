const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[1];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('awesome star', 'AS', tokenId, {from: accounts[0]})
    var res = await instance.tokenIdToStarInfo.call(tokenId)
    assert.equal(res["name"],'awesome star')
    assert.equal(res["symbol"],'AS')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'AS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let tokenId = 6;
    let instance = await StarNotary.deployed();
    await instance.createStar('awesome star2', 'AS2', tokenId, {from: accounts[0]})
    var res = await instance.tokenIdToStarInfo.call(tokenId)
    assert.equal(res["name"],'awesome star2')
    assert.equal(res["symbol"],'AS2')
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId1 = 7;
    await instance.createStar('awesome star7', 'AS7', tokenId1, {from: accounts[1]})
    let tokenId2 = 8;
    await instance.createStar('awesome star8', 'AS8', tokenId2, {from: accounts[2]})
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(tokenId1,tokenId2)
    // 3. Verify that the owners changed
    var afterOwner1 = await instance.ownerOf.call(tokenId1)
    var afterOwner2 = await instance.ownerOf.call(tokenId2)
    assert.equal(afterOwner2,accounts[1])
    assert.equal(afterOwner1,accounts[2])
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let tokenId1 = 9;
    await instance.createStar('awesome star9', 'AS9', tokenId1, {from: accounts[0]})
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1],tokenId1)
    // 3. Verify the star owner changed.
    var afterOwner = await instance.ownerOf.call(tokenId1)
    assert.equal(afterOwner, accounts[1])
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.lookUptokenIdToStarInfo(tokenId)
    var res = await instance.tokenIdToStarInfo.call(tokenId)
    assert.equal(res["name"],'awesome star')
    assert.equal(res["symbol"],'AS')
});