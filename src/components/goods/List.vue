<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!--卡片视图区域-->
      <el-card>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="goAddpage">添加商品</el-button>
          </el-col>
        </el-row>
        <!--table表格区域-->
        <el-table :data="goodslist" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" width="105px"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="160px">
            <template slot-scope="scope">
              {{scope.row.add_time | dataFormat}}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.goods_id)"></el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--分页区-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5, 10, 15, 20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background>
        </el-pagination>
      </el-card>
      <!--修改商品信息-->
      <el-dialog title="修改商品信息" :visible.sync="editGoodsDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="editGoodsForm" :rules="editGoodsFormRules" ref="editFormRef" label-width="90px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editGoodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="editGoodsForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="editGoodsForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="editGoodsForm.goods_weight"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editGoodsInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      total: 0,
      // 控制修改商品信息对话框的关闭于隐藏
      editGoodsDialogVisible: false,
      editGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: ''
      },
      // 添加表单验证规则
      editGoodsFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.$message.success('获取商品列表成功！')
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },
    async removeById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      this.getGoodsList()
    },
    goAddpage () {
      this.$router.push('/goods/add')
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示编辑商品的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败！')
      }
      this.editGoodsForm = res.data
      this.editGoodsDialogVisible = true
      console.log(res.data)
    },
    // 修改用户信息并提交
    editGoodsInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('goods/' + this.editGoodsForm.goods_id, {
          goods_name: this.editGoodsForm.goods_name,
          goods_price: this.editGoodsForm.goods_price,
          goods_number: this.editGoodsForm.goods_number,
          goods_weight: this.editGoodsForm.goods_weight
        })
        if (res.meta.status !== 201) {
          return this.$message.error('更新商品信息失败！')
        }
        // 提示修改成功
        this.$message.success('更新商品数据成功！')
        // 刷新数据列表
        this.getGoodsList()
        // 关闭对话框
        this.editGoodsDialogVisible = false
        console.log(res.data)
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
