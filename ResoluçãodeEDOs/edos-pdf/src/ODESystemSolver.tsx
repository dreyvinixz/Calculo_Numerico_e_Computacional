import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Tipos auxiliares
type ODEPoint = { x: number; y: number; z: number };
type ODEResult = { euler: ODEPoint[]; rk4: ODEPoint[] };

// Funções com tipagem explícita
const f1_q1 = (x: number, y: number, z: number): number => z;
const f2_q1 = (x: number, y: number, z: number): number => y + Math.exp(x);

const f1_q2 = (x: number, y: number, z: number): number =>
  -2 * y + 4 * Math.exp(-x);
const f2_q2 = (x: number, y: number, z: number): number => (-y * z * z) / 3;

const eulerMethod = (
  f1: (x: number, y: number, z: number) => number,
  f2: (x: number, y: number, z: number) => number,
  x0: number,
  y0: number,
  z0: number,
  h: number,
  xEnd: number
): ODEPoint[] => {
  const steps = Math.round(xEnd / h);
  let x = x0,
    y = y0,
    z = z0;
  const data: ODEPoint[] = [
    {
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(6)),
      z: parseFloat(z.toFixed(6)),
    },
  ];
  for (let i = 0; i < steps; i++) {
    const dy = h * f1(x, y, z);
    const dz = h * f2(x, y, z);
    y += dy;
    z += dz;
    x += h;
    data.push({
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(6)),
      z: parseFloat(z.toFixed(6)),
    });
  }
  return data;
};

const rk4Method = (
  f1: (x: number, y: number, z: number) => number,
  f2: (x: number, y: number, z: number) => number,
  x0: number,
  y0: number,
  z0: number,
  h: number,
  xEnd: number
): ODEPoint[] => {
  const steps = Math.round(xEnd / h);
  let x = x0,
    y = y0,
    z = z0;
  const data: ODEPoint[] = [
    {
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(6)),
      z: parseFloat(z.toFixed(6)),
    },
  ];
  for (let i = 0; i < steps; i++) {
    const k1y = h * f1(x, y, z);
    const k1z = h * f2(x, y, z);
    const k2y = h * f1(x + h / 2, y + k1y / 2, z + k1z / 2);
    const k2z = h * f2(x + h / 2, y + k1y / 2, z + k1z / 2);
    const k3y = h * f1(x + h / 2, y + k2y / 2, z + k2z / 2);
    const k3z = h * f2(x + h / 2, y + k2y / 2, z + k2z / 2);
    const k4y = h * f1(x + h, y + k3y, z + k3z);
    const k4z = h * f2(x + h, y + k3y, z + k3z);
    y += (k1y + 2 * k2y + 2 * k3y + k4y) / 6;
    z += (k1z + 2 * k2z + 2 * k3z + k4z) / 6;
    x += h;
    data.push({
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(6)),
      z: parseFloat(z.toFixed(6)),
    });
  }
  return data;
};

const ODESystemSolver: React.FC = () => {
  const [results1, setResults1] = useState<ODEResult>({ euler: [], rk4: [] });
  const [results2, setResults2] = useState<ODEResult>({ euler: [], rk4: [] });

  useEffect(() => {
    setResults1({
      euler: eulerMethod(f1_q1, f2_q1, 0, 1, 0, 0.1, 0.2),
      rk4: rk4Method(f1_q1, f2_q1, 0, 1, 0, 0.1, 0.2),
    });
    setResults2({
      euler: eulerMethod(f1_q2, f2_q2, 0, 2, 4, 0.2, 1.0),
      rk4: rk4Method(f1_q2, f2_q2, 0, 2, 4, 0.2, 1.0),
    });
  }, []);

  const chartData1 = results1.euler.map((eulerPoint, index) => ({
    x: eulerPoint.x,
    y_euler: eulerPoint.y,
    z_euler: eulerPoint.z,
    y_rk4: results1.rk4[index]?.y || 0,
    z_rk4: results1.rk4[index]?.z || 0,
  }));

  const chartData2 = results2.euler.map((eulerPoint, index) => ({
    x: eulerPoint.x,
    y_euler: eulerPoint.y,
    z_euler: eulerPoint.z,
    y_rk4: results2.rk4[index]?.y || 0,
    z_rk4: results2.rk4[index]?.z || 0,
  }));

  const exportToPDF = async () => {
    const printWindow = window.open("", "_blank");
    const contentElement = document.getElementById("pdf-content");
    if (!printWindow || !contentElement) return;
    const content = contentElement.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EDOs - Andrey Vinicius Santos Souza</title>
        <meta charset="utf-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
          }
          body { font-family: system-ui, -apple-system, sans-serif; }
        </style>
      </head>
      <body>
        <div class="max-w-7xl mx-auto">${content}</div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 1000);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      <div className="flex justify-end mb-4 no-print">
        <button
          onClick={exportToPDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Exportar para PDF
        </button>
      </div>

      <div id="pdf-content" className="space-y-10">
        {/* Cabeçalho */}
        <div className="text-center border-b-2 border-gray-300 pb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Resolução Numérica de Sistemas de EDOs
          </h1>
          <p className="text-xl text-gray-600 font-semibold">
            Andrey Vinicius Santos Souza - 164402
          </p>
          <p className="text-lg text-gray-500 mt-2">
            Métodos de Euler e Runge-Kutta 4ª Ordem
          </p>
        </div>

        {/* QUESTÃO 1 */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold text-blue-800 mb-4">QUESTÃO 1</h2>
            <div className="text-lg text-gray-700">
              <p className="mb-2">
                <strong>Sistema de EDOs:</strong>
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-blue-500 mb-4">
                <div className="text-xl">dy/dx = z</div>
                <div className="text-xl">
                  dz/dx = y + e<sup>x</sup>
                </div>
                <div className="mt-3">
                  <strong>Condições iniciais:</strong> y(0) = 1, z(0) = 0
                </div>
                <div>
                  <strong>Intervalo:</strong> x ∈ [0, 0.2], passo h = 0.1
                </div>
              </div>
            </div>
          </div>

          {/* Tabelas Questão 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              ["Euler", results1.euler, "bg-blue-50", "text-blue-800"],
              [
                "Runge-Kutta 4ª Ordem",
                results1.rk4,
                "bg-green-50",
                "text-green-800",
              ],
            ].map(([label, data, bgColor, textColor], i) => {
              const safeData = Array.isArray(data) ? data : [];
              return (
                <div key={i} className={`${bgColor} p-4 rounded-lg`}>
                  <h3 className={`text-xl font-bold mb-3 ${textColor}`}>
                    Método de {label}
                  </h3>
                  <table className="w-full text-sm border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-3 py-2">x</th>
                        <th className="border border-gray-300 px-3 py-2">y</th>
                        <th className="border border-gray-300 px-3 py-2">z</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeData.map((row: ODEPoint, idx: number) => (
                        <tr key={idx} className="bg-white">
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {row.x}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {row.y}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            {row.z}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Gráficos Questão 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              ["y(x)", "y_euler", "y_rk4"],
              ["z(x)", "z_euler", "z_rk4"],
            ].map(([label, keyEuler, keyRK4], i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Comparação: {label}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData1}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={keyEuler}
                      stroke="#3b82f6"
                      name="Euler"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey={keyRK4}
                      stroke="#10b981"
                      name="RK4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Análise Questão 1 */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-800 mb-3">
              Análise dos Resultados - Questão 1
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Diferença em y(0.2):</strong>
                </p>
                <p>
                  |{results1.rk4[2]?.y} - {results1.euler[2]?.y}| ={" "}
                  {Math.abs(results1.rk4[2]?.y - results1.euler[2]?.y).toFixed(
                    6
                  )}
                </p>
              </div>
              <div>
                <p>
                  <strong>Diferença em z(0.2):</strong>
                </p>
                <p>
                  |{results1.rk4[2]?.z} - {results1.euler[2]?.z}| ={" "}
                  {Math.abs(results1.rk4[2]?.z - results1.euler[2]?.z).toFixed(
                    6
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTÃO 2 */}
        <div className="space-y-6 border-t-4 border-gray-300 pt-8 page-break">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">
              QUESTÃO 2
            </h2>
            <div className="text-lg text-gray-700">
              <p className="mb-2">
                <strong>Sistema de EDOs:</strong>
              </p>
              <div className="bg-white p-4 rounded border-l-4 border-purple-500 mb-4">
                <div className="text-xl">
                  dy/dx = -2y + 4e<sup>-x</sup>
                </div>
                <div className="text-xl">dz/dx = -yz²/3</div>
                <div className="mt-3">
                  <strong>Condições iniciais:</strong> y(0) = 2, z(0) = 4
                </div>
                <div>
                  <strong>Intervalo:</strong> x ∈ [0, 1], passo h = 0.2
                </div>
              </div>
            </div>
          </div>

          {/* Tabelas Questão 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              ["Euler", results2.euler, "bg-purple-50", "text-purple-800"],
              [
                "Runge-Kutta 4ª Ordem",
                results2.rk4,
                "bg-green-50",
                "text-green-800",
              ],
            ].map(([label, data, bgColor, textColor], i) => (
              <div key={i} className={`${bgColor} p-4 rounded-lg`}>
                <h3 className={`text-xl font-bold mb-3 ${textColor}`}>
                  Método de {label}
                </h3>
                <table className="w-full text-sm border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-3 py-2">x</th>
                      <th className="border border-gray-300 px-3 py-2">y</th>
                      <th className="border border-gray-300 px-3 py-2">z</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {row.x}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {row.y}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {row.z}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Gráficos Questão 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              ["y(x)", "y_euler", "y_rk4"],
              ["z(x)", "z_euler", "z_rk4"],
            ].map(([label, keyEuler, keyRK4], i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Comparação: {label}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData2}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={keyEuler}
                      stroke="#8b5cf6"
                      name="Euler"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey={keyRK4}
                      stroke="#10b981"
                      name="RK4"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>

          {/* Tabela Comparativa Questão 2 */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Comparação Detalhada dos Métodos - Questão 2
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-2 py-2">x</th>
                    <th className="border border-gray-300 px-2 py-2">
                      y (Euler)
                    </th>
                    <th className="border border-gray-300 px-2 py-2">
                      y (RK4)
                    </th>
                    <th className="border border-gray-300 px-2 py-2">
                      z (Euler)
                    </th>
                    <th className="border border-gray-300 px-2 py-2">
                      z (RK4)
                    </th>
                    <th className="border border-gray-300 px-2 py-2">Erro y</th>
                    <th className="border border-gray-300 px-2 py-2">Erro z</th>
                  </tr>
                </thead>
                <tbody>
                  {results2.euler.map((eulerRow, idx) => {
                    const rk4Row = results2.rk4[idx];
                    return (
                      <tr key={idx} className="bg-white">
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {eulerRow.x}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {eulerRow.y}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {rk4Row?.y || 0}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {eulerRow.z}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {rk4Row?.z || 0}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {Math.abs((rk4Row?.y || 0) - eulerRow.y).toFixed(6)}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {Math.abs((rk4Row?.z || 0) - eulerRow.z).toFixed(6)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Análise Final */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-blue-800 mb-3">
              Conclusões Gerais
            </h3>
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>1.</strong> O método de Runge-Kutta de 4ª ordem
                apresenta maior precisão que o método de Euler em ambas as
                questões, especialmente em sistemas com comportamento
                não-linear.
              </p>
              <p>
                <strong>2.</strong> Na Questão 1, o sistema com crescimento
                exponencial mostra diferenças significativas entre os métodos,
                evidenciando a importância da escolha do método numérico.
              </p>
              <p>
                <strong>3.</strong> Na Questão 2, o sistema não-linear com termo
                -yz²/3 demonstra comportamento mais complexo, onde a precisão do
                RK4 é crucial para capturar corretamente a dinâmica do sistema.
              </p>
              <p>
                <strong>4.</strong> O erro acumulado é menor no método RK4
                devido à sua aproximação de ordem superior, tornando-o mais
                adequado para aplicações que requerem maior precisão.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
          }
        }
        `}
      </style>
    </div>
  );
};

export default ODESystemSolver;
