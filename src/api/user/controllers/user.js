
                  import { getPagination, getMeta } from "../../../services/pagination.js";
                  import User from "../models/user.js";
                  import { errorResponse } from "../../../services/errorResponse.js";
                  import { request, response } from "express";
              
                  export const create = async (req = request, res = response) => {
                      try {
                          const user = await User.create(req.body);
                          return res.status(200).send(user);
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const find = async (req = request, res = response) => {
                      try {
                          const query = req.query;
                          const pagination = await getPagination(query.pagination);
                          const users = await User.findAndCountAll({
                              offset: pagination.offset,
                              limit: pagination.limit
                          });
                          const meta = await getMeta(pagination, users.count);
                          return res.status(200).send({ data: users.rows, meta });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const findOne = async (req = request, res = response) => {
                      try {
                          const { id } = req.params;
                          const user = await User.findByPk(id);
                          if (!user) {
                              return res.status(404).send(errorResponse({ status: 404, message: "user not found!" }));
                          }
                          return res.status(200).send({ data: user });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const update = async (req = request, res = response) => {
                      try {
                          const { id } = req.params;
                          const getUser = await User.findByPk(id);
              
                          if (!getUser) {
                              return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                          }
              
                          const [rowCount, [user]] = await User.update(req.body, { where: { id }, returning: true });
                          return res.status(200).send({ message: "user updated!", data: user });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
              
                  export const destroy = async (req = request, res = response) => {
                      try {
                          const { id } = req.params;
                          const getUser = await User.findByPk(id);
              
                          if (getUser) {
                              return res.status(400).send(errorResponse({ message: "Invalid ID" }));
                          }
              
                          const user = User.destroy({ where: { id } });
                          return res.status(200).send({ message: "user deleted!" });
                      } catch (error) {
                          console.log(error);
                          return res.status(500).send(errorResponse({ status: 500, message: "Internal Server Error", details: error.message }));
                      }
                  };
                