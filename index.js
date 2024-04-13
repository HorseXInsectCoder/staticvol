const fs = require('fs');
const path = require('path');

class WebTrafficAnalyzer {
  constructor(logFilePath) {
    this.logFilePath = logFilePath;
    this.totalVisits = 0;
    this.uniqueVisitors = new Set();
    this.pageVisits = {};
    this.hourlyVisits = {};
    this.geoVisits = {};
  }

  analyzeTraffic() {
    const logData = fs.readFileSync(this.logFilePath, 'utf8');
    const logLines = logData.trim().split('\n');

    for (const line of logLines) {
      const parts = line.split(' ');
      const ip = parts[0];
      const timestamp = new Date(parts[3].replace('[', '').replace(']', '')).getHours();
      const url = parts[6].split(' ')[1];
      const pagePath = new URL(url, `http://${ip}`).pathname;
      const geo = parts[0].startsWith('::') ? 'Unknown' : this.geolocateIP(ip);

      this.totalVisits++;
      this.uniqueVisitors.add(ip);
      this.pageVisits[pagePath] = (this.pageVisits[pagePath] || 0) + 1;
      this.hourlyVisits[timestamp] = (this.hourlyVisits[timestamp] || 0) + 1;
      this.geoVisits[geo] = (this.geoVisits[geo] || 0) + 1;
    }
  }

  geolocateIP(ip) {
    // You can integrate IP geolocation API or database here
    // For simplicity, we'll just return a rough location based on IP prefix
    if (ip.startsWith('192.168.')) return 'Local Network';
    if (ip.startsWith('10.')) return 'Local Network';
    return 'Unknown';
  }

  printStats() {
    console.log(`Total Visits: ${this.totalVisits}`);
    console.log(`Unique Visitors: ${this.uniqueVisitors.size}`);
    console.log('Top Pages:');
    for (const [page, visits] of Object.entries(this.pageVisits).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${page}: ${visits} visits`);
    }
    console.log('Hourly Trend:');
    for (const [hour, visits] of Object.entries(this.hourlyVisits)) {
      console.log(`  ${hour}:00 - ${visits} visits`);
    }
    console.log('Visitor Locations:');
    for (const [geo, visits] of Object.entries(this.geoVisits)) {
      console.log(`  ${geo}: ${visits} visits`);
    }
  }
}

// Usage example
const logFilePath = path.join(__dirname, 'access.log');
const analyzer = new WebTrafficAnalyzer(logFilePath);
analyzer.analyzeTraffic();
analyzer.printStats();


module.exports = {
  WebTrafficAnalyzer
}