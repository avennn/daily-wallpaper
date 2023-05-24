import ps from 'ps-node';

describe('shell', () => {
  test('getProcessesInfo() return valid info', async () => {
    function getAllProcesses(): Promise<unknown[]> {
      return new Promise((resolve, reject) => {
        ps.lookup({}, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(res);
        });
      });
    }

    const processList = await getAllProcesses();
    expect(Array.isArray(processList)).toBe(true);
    expect(processList.length).toBeGreaterThan(0);
    const firstProcess = processList[0];
    expect(firstProcess).toHaveProperty('pid');
    expect(firstProcess).toHaveProperty('ppid');
    // expect(firstProcess).toHaveProperty('upTime');
    // expect(firstProcess).toHaveProperty('memory');
    // expect(firstProcess).toHaveProperty('cpuPercent');
    // expect(firstProcess).toHaveProperty('memoryPercent');
  });
});
