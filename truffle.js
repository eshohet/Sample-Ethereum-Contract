module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      from: "0xb24e066a214736ad653d8aa4a310abebf7fb23a7"
    }
  }
};
