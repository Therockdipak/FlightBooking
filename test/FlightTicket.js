 const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlightTicket", function () {
  let flightTicket;
  let owner;
  let passenger;
  let price;
  beforeEach(async () => {
    [owner, passenger] = await ethers.getSigners();
    const contractName = "FlightTicket";
    const totalSeats = 100;
    const price = ethers.parseEther("1");
    flightTicket = await ethers.deployContract(contractName, [
      totalSeats,
      price,
    ]);
    await flightTicket.waitForDeployment();
  });

  it("Should deploy the contract correctly", async () => {
    totalSeats = 100;
    expect(await flightTicket.totalSeats()).to.equal(100);
    expect(await flightTicket.price()).to.equal(ethers.parseEther("1"));
    expect(await flightTicket.Airline()).to.equal(owner.address);
  });

  it("should book a seat successfully", async () => {
    const seatNumber = 1;
    await flightTicket
      .connect(passenger)
      .BookYourSeat(seatNumber, { value: ethers.parseEther("1") });
    // get the seat information
    const seatInfo = await flightTicket.seats(seatNumber);

    expect(seatInfo.passenger).to.equal(passenger.address);
    expect(seatInfo.isBooked).to.equal(true);
  });

  it("should not allow booking an already booked seat", async () => {
    seatNumber = 1;
    await flightTicket
      .connect(passenger)
      .BookYourSeat(seatNumber, { value: ethers.parseEther("1") });
    await expect(
      flightTicket
        .connect(passenger)
        .BookYourSeat(seatNumber, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("seat unavailable");
  });

  it("should not allow booking with an invalid seat number", async () => {
    await expect(
      flightTicket
        .connect(passenger)
        .BookYourSeat(0, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("invalid seat number");
    await expect(
      flightTicket
        .connect(passenger)
        .BookYourSeat(101, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("invalid seat number");
  });

  it("should not allow booking without enough payment", async () => {
    const seatNumber = 1;
    await expect(
      flightTicket
        .connect(passenger)
        .BookYourSeat(seatNumber, { value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("enter valid amount");
  });

  it("should check status correctly by Airline", async () => {
    const seatNumber = 1;
    await flightTicket
      .connect(passenger)
      .BookYourSeat(seatNumber, { value: ethers.parseEther("1") });
    expect(await flightTicket.connect(owner).checkStatus(seatNumber)).to.be
      .true;
  });

  it("Should cancel a seat successfully by the airline", async function () {
    const seatNumber = 1;
    await flightTicket
      .connect(passenger)
      .BookYourSeat(seatNumber, { value: ethers.parseEther("1") });
    await flightTicket.connect(owner).cancelSeat(seatNumber);
    // fetch the seat information after cancellaton
    const seatInfo = await flightTicket.seats(seatNumber);

    expect(seatInfo.passenger).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(seatInfo.isBooked).to.equal(false);
  });
});

    
    
