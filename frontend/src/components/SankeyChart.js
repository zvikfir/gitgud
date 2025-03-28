import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TreeChart = () => {
  const ref = useRef();
  const [data, setData] = useState({
    name: "GitLab",
    children: [
      {
        name: "Project 1",
        children: [
          { name: "Policy 1", children: [{ name: "KPI 1" }] },
          { name: "Policy 2", children: [{ name: "KPI 2" }] }
        ]
      },
      {
        name: "Project 2",
        children: [
          { name: "Policy 3", children: [{ name: "KPI 3" }] },
          { name: "Policy 4", children: [{ name: "KPI 1" }] }
        ]
      }
    ]
  });

  useEffect(() => {
    const width = 928;

    const updateTree = () => {
      const root = d3.hierarchy(data);
      const dx = 10;
      const dy = width / (root.height + 1);

      const tree = d3.cluster().nodeSize([dx, dy]);
      root.sort((a, b) => d3.ascending(a.data.name, b.data.name));
      tree(root);

      let x0 = Infinity;
      let x1 = -x0;
      root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
      });

      const height = x1 - x0 + dx * 2;

      const svg = d3.select(ref.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-dy / 3, x0 - dx, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

      const link = svg.selectAll("path")
        .data(root.links(), d => d.target.data.name);

      link.enter().append("path")
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x))
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .merge(link)
        .transition().duration(750)
        .attr("d", d3.linkHorizontal()
          .x(d => d.y)
          .y(d => d.x));

      link.exit().remove();

      const node = svg.selectAll("g")
        .data(root.descendants(), d => d.data.name);

      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

      nodeEnter.append("circle")
        .attr("fill", d => d.children ? "#555" : "#999")
        .attr("r", 4);

      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children ? -6 : 6)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .attr("stroke", "white")
        .attr("paint-order", "stroke");

      nodeEnter.merge(node)
        .transition().duration(750)
        .attr("transform", d => `translate(${d.y},${d.x})`);

      node.exit().remove();
    };

    updateTree();

  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add or remove a policy from a project
      setData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData)); // Deep clone the data

        // Randomly select a project
        const projectIndex = Math.floor(Math.random() * newData.children.length);
        const project = newData.children[projectIndex];

        if (Math.random() > 0.5) {
          // Add a new policy
          project.children.push({
            name: `Policy ${Math.floor(Math.random() * 100)}`,
            children: [{ name: `KPI ${Math.floor(Math.random() * 3) + 1}` }]
          });
        } else if (project.children.length > 1) {
          // Remove a policy
          project.children.pop();
        }

        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return <svg ref={ref}></svg>;
};

export default TreeChart;
