<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图-->
      <el-card>
        <!--添加角色按钮区-->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>
        <!--角色列表-->
        <el-table :data="rolelist" border stripe>
          <!--type="expand"可展开列-->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row :class="['bdbottm', i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                <!--渲染一级权限-->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!--渲染二级和三级权限-->
                <el-col :span="19">
                  <!--通过for嵌套渲染二级权限-->
                  <el-row :class="[i2 === 0 ? '':'bdtop', 'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{item2.authName}} </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                          <el-tag :class="[i3 === 0 ? '':'bdtop']" type="warning"
                                  closable v-for="(item3, i3) in item2.children"
                                  :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!--<pre>
                {{scope.row}}
              </pre>-->
            </template>
          </el-table-column>
          <!--索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="small" @click="showRolesDialog(scope.row.id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="small" @click="removeRolesById(scope.row.id)">删除</el-button>
              <el-button type="warning" icon="el-icon-setting" size="small" @click="showSetRightDialog(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!--添加角色的对话框-->
      <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="55%" @close="addRolesDialogClosed">
        <!--内容主题区-->
        <el-form :model="addRoleForm" :rules="addRolesRules" ref="addRolesRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!--底部区-->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改角色-->
      <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" @close="editRoleDialogClosed">
        <el-form :model="editRoleForm" :rules="addRolesRules" ref="editRoleFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!--分配权限-->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialogClosed">
        <!--树形控件-->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all
                 :default-checked-keys="defKeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      addDialogVisible: false,
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRolesRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      editRoleDialogVisible: false,
      editRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树型控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的id值的数组
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      // 获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败!')
      }
      this.rolelist = res.data
      console.log(res)
    },
    // 根据id删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示
      const confirmResult = await this.$confirm('此操作将永久删除该用户的此权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
      ).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.error('操作取消！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      } else {
        this.$message.success('删除权限成功！')
        // this.getRolesList()
        role.children = res.data
      }
    },
    // 监听添加角色对话框的关闭事件
    addRolesDialogClosed () {
      this.$refs.addRolesRef.resetFields()
    },
    // 添加角色
    // eslint-disable-next-line vue/no-dupe-keys
    addRoles () {
      this.$refs.addRolesRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 展示修改角色的对话框
    async showRolesDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败！')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
      console.log(res)
    },
    // 修改角色信息
    editRoleInfo () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败！')
        }
        this.editRoleDialogVisible = false
        this.getRolesList()
        this.$message.success('修改角色成功！')
        console.log(res)
      })
    },
    // 删除用户角色
    async removeRolesById (id) {
      console.log(id)
      const confirmReslut = await this.$confirm(
        '此操作将永久删除该用户数据, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      if (confirmReslut !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户角色失败！')
      }
      this.$message.success('已成功删除用户角色！')
      this.getRolesList()
      console.log(res)
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的列表
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      this.rightsList = res.data
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
      console.log(this.rightsList)
    },
    // 通过递归形式，获取角色下的所有三级权限的id，并保存在derKeys中
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children属性，则是三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item =>
        this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
      console.log(keys)
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
  .bdtop{
    border-top: 1px solid#eee;
  }
  .bdbottm{
    border-bottom: 1px solid #eee;
  }
  .vcenter{
    display: flex;
    align-items: center;
  }
</style>
